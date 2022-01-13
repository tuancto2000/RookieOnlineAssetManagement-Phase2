import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  InputGroup,
  FormControl,
  Modal,
  Row,
  Form,
} from "react-bootstrap";
import "react-datepicker/dist/react-datepicker.css";
import { GoTriangleDown } from "react-icons/go";
import { BsCheckLg } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import ReactDatePicker from "react-datepicker";
import ReactPaginate from "react-paginate";
import { MultiSelect } from "react-multi-select-component";
import { HiFilter } from "react-icons/hi";
import { BsSearch } from "react-icons/bs";
import { BsFillCalendarDateFill } from "react-icons/bs";
import { MdOutlineCancelPresentation } from "react-icons/md";
import {
  GetReturnRequestPagingFilter,
  GetRequestState,
  GetDetail,
  CancelRequest,
} from "../../services/returnRequestService";
import { Complete } from "../../services/returnRequestService";

const ListRequests = () => {
  const [returnRequests, setReturnRequests] = useState([]);
  const [isFilter, setIsFilter] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [sortBy, setSortBy] = useState("assetCode");
  const [isAscending, setIsAscending] = useState();
  const [keyword, setKeyword] = useState();
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState([]);
  const [dateFilter, setDateFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState();
  const [searchFilterModel, setSearchFilterModel] = useState({});
  const [isShowDetail, setIsShowDetail] = useState(false);
  const [detailId, setDetailId] = useState();
  const [isCompleted, setIsCompleted] = useState(false);
  const [rrequestId, setRrequestId] = useState(undefined);
  const [isCancelRequest, setIsCancelRequest] = useState(false);
  const [idCancelRequest, setIdCancelRequest] = useState();
  const [detailedReturnRequest, setDetailedReturnRequest] = useState({
    id: detailId,
    code: "",
    name: "",
    RequestByName: "",
    AcceptedByName: "",
    AssignedDate: null,
    ReturnedDate: null,
    state: "",
  });

  const handleSearch = () => {
    setIsSearch(true);
    setCurrentPage(1);
  };

  const handlePageChange = (event) => {
    setCurrentPage(event.selected + 1);
  };

  const StateToString = (state) => {
    switch (state) {
      case 0:
        return "Waiting For Returning";
        break;
      case 1:
        return "Completed";
        break;
      case 2:
        return "Declined";
        break;
      default:
        return "Unknown";
        break;
    }
  };

  const formatDate = (date) => {
    if (date !== null && date !== undefined) {
      var d = new Date(date),
        month = "" + (d.getMonth() + 1),
        day = "" + d.getDate(),
        year = d.getFullYear();

      if (month.length < 2) month = "0" + month;
      if (day.length < 2) day = "0" + day;

      return [month, day, year].join("/");
    } else {
      return null;
    }
  };

  useEffect(() => {
    GetRequestState()
      .then((response) => {
        const arrState = response.map((x) => ({
          value: x.value,
          label: x.name,
        }));
        setStates(arrState);
        setSelectedState(arrState);
      })
      .catch((error) => console.log(error));
  }, []);

  useEffect(() => {
    setSearchFilterModel({
      ...searchFilterModel,
      isAscending: isAscending,
      sortBy: sortBy,
      keyword: keyword,
      statesFilter: selectedState.map((s) => s.value).toString(),
      pageIndex: currentPage,
      returnedDateFilter: formatDate(dateFilter),
    });
    setIsFilter(true);
  }, [selectedState, isSearch, sortBy, isAscending, dateFilter]);

  //Pagination only
  useEffect(() => {
    setSearchFilterModel({
      ...searchFilterModel,
      pageIndex: currentPage,
    });
    setIsFilter(true);
  }, [currentPage]);

  useEffect(() => {
    GetReturnRequestPagingFilter(searchFilterModel)
      .then((response) => {
        setReturnRequests([...response.items]);
        setIsFilter(false);
        setIsSearch(false);
        setTotalPages(response.pageCount);
      })
      .catch((error) => console.log(error));
  }, [isFilter]);

  useEffect(() => {
    if (isShowDetail == true) {
      GetDetail(detailId).then((res) => {
        setDetailedReturnRequest({
          ...detailedReturnRequest,
          code: res.assetCode,
          name: res.assetName,
          RequestByName: res.requestByName,
          AcceptedByName: res.acceptedByName,
          AssignedDate: formatDate(res.assignedDate),
          ReturnedDate: formatDate(res.returnedDate),
          state: StateToString(res.state),
        });
        setDetailId(0);
      });
    }
  }, [isShowDetail]);

  const handleCompleted = () => {
    var data = new FormData();
    console.log(rrequestId);
    Complete(rrequestId, data)
      .then((response) => {
        console.log("State RR");
        setIsCompleted(false);
        setIsAscending(!isAscending);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const handleCancelRequest = () => {
    CancelRequest(idCancelRequest)
      .then((res) => {
        setIsFilter(true);
      })
      .catch((error) => {
        setIsCancelRequest(false);
      });
    setIsCancelRequest(false);
  };
  return (
    <div style={{ padding: "100px 50px", width: "1300px" }}>
      <div
        style={{
          color: "#dc3545",
          fontSize: "25px",
          fontWeight: "bold",
          marginBottom: "25px",
        }}
      >
        Request List
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: "20px",
        }}
      >
        <div style={{ display: "flex" }}>
          <div style={{ width: "220px" }}>
            <MultiSelect
              options={states}
              value={selectedState}
              onChange={setSelectedState}
              labelledBy="State"
              disableSearch={true}
              valueRenderer={() => "State"}
              ArrowRenderer={() => (
                <div
                  style={{
                    borderLeft: "1px solid #ccc",
                    height: "40px",
                    paddingLeft: "10px",
                  }}
                >
                  <HiFilter style={{ fontSize: "18px", marginTop: "12px" }} />
                </div>
              )}
              ClearSelectedIcon={() => ""}
            />
          </div>
          <div style={{ width: "220px", marginLeft: "25px" }}>
            <ReactDatePicker
              selected={dateFilter}
              onChange={async (date) => {
                await setDateFilter(date);
                setCurrentPage(1);
              }}
              customInput={
                <div
                  style={{
                    margin: "0",
                    border: "1px solid #ccc",
                    height: "40px",
                    display: "flex",
                    borderRadius: "5%",
                  }}
                >
                  <label
                    style={{
                      borderRight: "1px solid #ccc",
                      width: "180px",
                      alignItems: "center",
                      display: "flex",
                      paddingLeft: "10px",
                    }}
                  >
                    Returned Date
                  </label>
                  <div
                    style={{
                      alignItems: "center",
                      display: "flex",
                      fontSize: "17px",
                      paddingLeft: "10px",
                    }}
                  >
                    <BsFillCalendarDateFill />
                  </div>
                </div>
              }
            />
          </div>
        </div>

        <InputGroup style={{ width: "250px" }}>
          <FormControl
            type="search"
            placeholder="Search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <Button style={{ backgroundColor: "#FFF", borderColor: "#ced4da" }}>
            <BsSearch
              style={{ color: "#000", marginBottom: "3px" }}
              onClick={handleSearch}
            />
          </Button>
        </InputGroup>
      </div>
      <Table
        style={{
          width: "1235px",
          height: "400px",
        }}
      >
        <thead>
          <tr>
            <th style={{ width: "70px" }}>
              No.
              <GoTriangleDown
                style={{
                  marginLeft: "5px",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setIsAscending(!isAscending);
                  setSortBy("no.");
                }}
              />
            </th>
            <th style={{ width: "140px" }}>
              Asset Code
              <GoTriangleDown
                style={{
                  marginLeft: "5px",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setIsAscending(!isAscending);
                  setSortBy("assetCode");
                }}
              />
            </th>
            <th style={{ width: "140px" }}>
              Asset Name
              <GoTriangleDown
                style={{
                  marginLeft: "5px",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setIsAscending(!isAscending);
                  setSortBy("assetName");
                }}
              />
            </th>
            <th style={{ width: "155px" }}>
              Requested By
              <GoTriangleDown
                style={{
                  marginLeft: "5px",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setIsAscending(!isAscending);
                  setSortBy("requestedBy");
                }}
              />
            </th>
            <th style={{ width: "155px" }}>
              Assigned Date
              <GoTriangleDown
                style={{
                  marginLeft: "5px",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setIsAscending(!isAscending);
                  setSortBy("assignedDate");
                }}
              />
            </th>
            <th style={{ width: "140px" }}>
              Accepted By
              <GoTriangleDown
                style={{
                  marginLeft: "5px",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setIsAscending(!isAscending);
                  setSortBy("acceptedBy");
                }}
              />
            </th>
            <th style={{ width: "155px" }}>
              Returned Date
              <GoTriangleDown
                style={{
                  marginLeft: "5px",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setIsAscending(!isAscending);
                  setSortBy("returnedDate");
                }}
              />
            </th>
            <th style={{ width: "140px" }}>
              State
              <GoTriangleDown
                style={{
                  marginLeft: "5px",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setIsAscending(!isAscending);
                  setSortBy("state");
                }}
              />
            </th>
            <th style={{ textAlign: "left", width: "140px" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {returnRequests &&
            returnRequests.map((request) =>
              StateToString(request.state) === "Declined" ? (
                ""
              ) : (
                <tr>
                  <td
                    onClick={() => {
                      setIsShowDetail(true);
                      setDetailId(request.id);
                    }}
                    style={{ cursor: "pointer", width: "70px" }}
                  >
                    {request.ordinal}
                  </td>
                  <td
                    onClick={() => {
                      setIsShowDetail(true);
                      setDetailId(request.id);
                    }}
                    style={{ cursor: "pointer", width: "140px" }}
                  >
                    {request.assetCode}
                  </td>
                  <td
                    onClick={() => {
                      setIsShowDetail(true);
                      setDetailId(request.id);
                    }}
                    style={{ cursor: "pointer", width: "140px" }}
                  >
                    {request.assetName}
                  </td>
                  <td
                    onClick={() => {
                      setIsShowDetail(true);
                      setDetailId(request.id);
                    }}
                    style={{ cursor: "pointer", width: "155px" }}
                  >
                    {request.requestByName}
                  </td>
                  <td
                    onClick={() => {
                      setIsShowDetail(true);
                      setDetailId(request.id);
                    }}
                    style={{ cursor: "pointer", width: "155px" }}
                  >
                    {formatDate(request.assignedDate)}
                  </td>
                  <td
                    onClick={() => {
                      setIsShowDetail(true);
                      setDetailId(request.id);
                    }}
                    style={{ cursor: "pointer", width: "140px" }}
                  >
                    {request.acceptedByName}
                  </td>
                  <td
                    onClick={() => {
                      setIsShowDetail(true);
                      setDetailId(request.id);
                    }}
                    style={{ cursor: "pointer", width: "155px" }}
                  >
                    {formatDate(request.returnedDate)}
                  </td>
                  <td
                    onClick={() => {
                      setIsShowDetail(true);
                      setDetailId(request.id);
                    }}
                    style={{ cursor: "pointer", width: "140px" }}
                  >
                    {StateToString(request.state)}
                  </td>
                  <td
                    style={{
                      textAlign: "left",
                      paddingLeft: "20px",
                      width: "140px",
                    }}
                  >
                    <BsCheckLg
                      onClick={() => {
                        if (StateToString(request.state) !== "Completed") {
                          setRrequestId(request.id);
                          setIsCompleted(true);
                        }
                      }}
                      style={{
                        fontSize: "18px",
                        color: `${
                          StateToString(request.state) === "Completed"
                            ? "#808080"
                            : "#dc3545"
                        }`,
                        cursor: `${
                          StateToString(request.state) === "Completed"
                            ? "default"
                            : "pointer"
                        }`,
                      }}
                    />
                    <IoClose
                      onClick={() => {
                        if (StateToString(request.state) !== "Completed") {
                          setIdCancelRequest(request.id);
                          setIsCancelRequest(true);
                        }
                      }}
                      style={{
                        fontSize: "25px",
                        marginLeft: "5px",
                        color: `${
                          StateToString(request.state) === "Completed"
                            ? "#f2a7ac"
                            : "#000"
                        }`,
                        fontSize: "25px",
                        cursor: `${
                          StateToString(request.state) === "Completed"
                            ? "default"
                            : "pointer"
                        }`,
                      }}
                    />
                  </td>
                </tr>
              )
            )}
        </tbody>
      </Table>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          width: "100%",
          marginTop: "30px",
        }}
      >
        <ReactPaginate
          pageCount={totalPages}
          forcePage={currentPage - 1}
          breakLabel="..."
          previousLabel="Previous"
          nextLabel="Next"
          pageRangeDisplayed={2}
          marginPagesDisplayed={2}
          pageClassName="page-item"
          pageLinkClassName="page-link"
          previousClassName="page-item"
          previousLinkClassName="page-link"
          nextClassName="page-item"
          nextLinkClassName="page-link"
          breakClassName="page-item"
          breakLinkClassName="page-link"
          containerClassName="pagination"
          activeClassName="active"
          renderOnZeroPageCount={null}
          onPageChange={(event) => handlePageChange(event)}
        />
      </div>

      <Modal dialogClassName="modal-90w" centered show={isShowDetail}>
        <Modal.Header style={{ backgroundColor: "#DDE1E5" }}>
          <Modal.Title
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#dc3545",
              marginLeft: "20px",
            }}
          >
            Detailed Return Request Information
          </Modal.Title>
          <MdOutlineCancelPresentation
            onClick={() => {
              setIsShowDetail(false);
            }}
            style={{
              color: "#dc3545",
              fontSize: "20px",
              cursor: "pointer",
            }}
          />
        </Modal.Header>

        <Modal.Body
          style={{
            marginLeft: "20px",
          }}
        >
          <Row style={{ display: "inline" }}>
            <Form.Label column="sm" lg={4}>
              Asset Code
            </Form.Label>

            <Form.Label column="sm" lg={8}>
              {detailedReturnRequest.code}
            </Form.Label>
          </Row>
          <br />
          <Row style={{ display: "inline" }}>
            <Form.Label column="sm" lg={4}>
              Asset name
            </Form.Label>

            <Form.Label column="sm" lg={8}>
              {detailedReturnRequest.name}
            </Form.Label>
          </Row>
          <br />
          <Row style={{ display: "inline" }}>
            <Form.Label column="sm" lg={4}>
              Request By Name
            </Form.Label>

            <Form.Label column="sm" lg={8}>
              {detailedReturnRequest.RequestByName}
            </Form.Label>
          </Row>
          <br />
          <Row style={{ display: "inline" }}>
            <Form.Label column="sm" lg={4}>
              Accepted By Name
            </Form.Label>

            <Form.Label column="sm" lg={8}>
              {detailedReturnRequest.AcceptedByName}
            </Form.Label>
          </Row>
          <br />
          <Row style={{ display: "inline" }}>
            <Form.Label column="sm" lg={4}>
              Assigned Date
            </Form.Label>

            <Form.Label column="sm" lg={8}>
              {detailedReturnRequest.AssignedDate}
            </Form.Label>
          </Row>
          <br />
          <Row style={{ display: "inline" }}>
            <Form.Label column="sm" lg={4}>
              Returned Date
            </Form.Label>

            <Form.Label column="sm" lg={8}>
              {detailedReturnRequest.ReturnedDate}
            </Form.Label>
          </Row>
          <br />
          <Row style={{ display: "inline" }}>
            <Form.Label column="sm" lg={4}>
              State
            </Form.Label>
            <Form.Label column="sm" lg={8}>
              {detailedReturnRequest.state}
            </Form.Label>
          </Row>
          <br />
        </Modal.Body>
      </Modal>
      <Modal show={isCancelRequest} centered>
        <Modal.Header style={{ backgroundColor: "#DDE1E5" }}>
          <Modal.Title
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#dc3545",
              marginLeft: "20px",
            }}
          >
            Are you sure ?
          </Modal.Title>
        </Modal.Header>

        <Modal.Body
          style={{
            marginLeft: "20px",
          }}
        >
          <p>Do you want to cancel this returning request ?</p>
        </Modal.Body>

        <Modal.Footer
          style={{ justifyContent: "flex-start", marginLeft: "20px" }}
        >
          <Button
            style={{
              backgroundColor: "#dc3545",
              border: "1px solid #dc3545",
              borderRadius: "4px",
            }}
            onClick={() => handleCancelRequest()}
          >
            Yes
          </Button>
          <Button
            style={{
              backgroundColor: "#FFF",
              border: "1px solid rgb(89 86 86)",
              borderRadius: "4px",
              color: "black",
              marginLeft: "20px",
            }}
            onClick={() => {
              setIsCancelRequest(false);
            }}
          >
            No
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={isCompleted} centered>
        <Modal.Header style={{ backgroundColor: "#DDE1E5" }}>
          <Modal.Title
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#dc3545",
              marginLeft: "20px",
            }}
          >
            Are you sure ?
          </Modal.Title>
        </Modal.Header>

        <Modal.Body
          style={{
            marginLeft: "20px",
          }}
        >
          <p>Do you want to mark this returning request as "Completed" ?</p>
        </Modal.Body>

        <Modal.Footer
          style={{ justifyContent: "flex-start", marginLeft: "20px" }}
        >
          <Button
            style={{
              backgroundColor: "#dc3545",
              border: "1px solid #dc3545",
              borderRadius: "4px",
            }}
            onClick={handleCompleted}
          >
            Yes
          </Button>
          <Button
            style={{
              backgroundColor: "#FFF",
              border: "1px solid rgb(89 86 86)",
              borderRadius: "4px",
              color: "black",
              marginLeft: "20px",
            }}
            onClick={() => {
              setIsCompleted(false);
            }}
          >
            No
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ListRequests;
