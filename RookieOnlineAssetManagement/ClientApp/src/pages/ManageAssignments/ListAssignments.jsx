import React from "react";
import { Modal, Table, Button, FormControl, InputGroup, Row, Form } from "react-bootstrap";
import { BsFillCalendarDateFill } from "react-icons/bs";
import { MdEdit, MdOutlineCancelPresentation } from "react-icons/md";
import { IoReloadOutline } from "react-icons/io5";
import { CgCloseO } from "react-icons/cg";
import { useState, useEffect } from "react";
import { Link, useLocation, useHistory } from "react-router-dom";
import { GetAssignmentState, GetDetail, Delete, GetAssignmentsPagingDefault, GetAssignmentsPagingFilter } from "../../services/assignmentService";
import { MultiSelect } from "react-multi-select-component";
import { HiFilter } from "react-icons/hi";
import { BsSearch } from "react-icons/bs";
import { GoTriangleDown } from "react-icons/go";
import ReactPaginate from "react-paginate";
import queryString from "query-string";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Create } from "../../services/returnRequestService";
const ListAssignments = () => {
  const { search } = useLocation();
  const params = queryString.parse(search);
  const history = useHistory();
  const [afterUpdated, setAfterUpdated] = useState(params.IsSortByUpdatedDate);
  const [afterCreated, setAfterCreated] = useState(params.IsSortByCreatedDate);
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState([]);
  const [dateFilter, setDateFilter] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [idDeletingAssignment, setIdDeletingAssignment] = useState();
  const [isFilter, setIsFilter] = useState(false);
  const [keyword, setKeyword] = useState();
  const [isSearch, setIsSearch] = useState(false);
  const [isAscending, setIsAscending] = useState();
  const [sortBy, setSortBy] = useState("assetCode");
  const [totalPages, setTotalPages] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchFilterModel, setSearchFilterModel] = useState({ sortBy: "assetCode" });
  const [detailId, setDetailId] = useState();
  const [isShowDetail, setIsShowDetail] = useState(false);
  const [isCreated, setIsCreated] = useState(false);
  const [detailedAssignment, setDetailedAssignment] = useState({
    id: detailId,
    code: "",
    name: "",
    specification: "",
    AssignedTo: "",
    AssignedBy: "",
    AssignedDate: null,
    state: "",
    note: "",
  });
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
  const StateToString = (state) => {
    switch (state) {
      case 0:
        return "Waiting For Acceptance";
        break;
      case 1:
        return "Accepted";
        break;
      case 2:
        return "Declined";
        break;
      case 3:
        return "Waiting For Returning";
        break;
      case 4:
        return "Returned";
        break;
      default:
        return "Unknown";
        break;
    }
  };
  useEffect(() => {
    GetAssignmentState()
      .then((response) => {
        const arrState = response.map((x) => ({
          value: x.value,
          label: x.name,
        }));
        setStates(arrState);
        setSelectedState(arrState);
      })
      .catch((error) => console.log(error));

    GetAssignmentsPagingDefault(afterCreated, afterUpdated)
      .then((response) => {
        setAssignments([...response.items]);
        setTotalPages(response.pageCount);
        history.replace("/assignments");
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
      IsSortByCreatedDate: afterCreated,
      IsSortByUpdatedDate: afterUpdated,
      pageIndex: currentPage,
      assignedDateFilter: formatDate(dateFilter),
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
    GetAssignmentsPagingFilter(searchFilterModel)
      .then((response) => {
        setAssignments([...response.items]);
        setIsFilter(false);
        setIsSearch(false);
        setTotalPages(response.pageCount);
      })
      .catch((error) => console.log(error));
  }, [isFilter]);
  const handleDelete = () => {
    Delete(idDeletingAssignment)
      .then((res) => {
        GetAssignmentsPagingFilter(searchFilterModel)
          .then((response) => setAssignments([...response.items]))
          .catch((error) => console.log(error));
      })
      .catch((error) => {
        setIsDeleting(false);
      });
    setIsDeleting(false);
  };
  const onSearchClick = () => {
    setIsSearch(true);
    setCurrentPage(1);
  };
  const handlePageChange = (event) => {
    setCurrentPage(event.selected + 1);
  };
  useEffect(() => {
    if (isShowDetail == true) {
      GetDetail(detailId).then((res) => {
        setDetailedAssignment({
          ...detailedAssignment,
          code: res.assetCode,
          name: res.assetName,
          specification: res.specification,
          AssignedTo: res.assignedToName,
          AssignedBy: res.assignedByName,
          AssignedDate: formatDate(res.assignedDate),
          state: StateToString(res.state),
          note: res.note,
        });
        setDetailId(0);
      });
    }
  }, [isShowDetail]);
  console.log("create", afterCreated, "update", afterUpdated);

  const handleCreated = () => {
    const data = new FormData();
    data.append("assignmentId", idDeletingAssignment);
    Create(data)
      .then((response) => {
        console.log("Created RR");
        setIsCreated(false);
        setIsFilter(true);
      })
      .catch((e) => {
        console.log(e);
      });
  };
  return (
    <React.Fragment>
      <div style={{ padding: "100px 50px" }}>
        <div
          style={{
            color: "#dc3545",
            fontSize: "25px",
            fontWeight: "bold",
            marginBottom: "25px",
          }}
        >
          Assignment List
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "1100px",
            paddingBottom: "20px",
          }}
        >
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
          <div style={{ width: "220px" }}>
            <ReactDatePicker
              selected={dateFilter}
              onChange={(date) => {
                setDateFilter(date);
                console.log(formatDate(date));
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
                    Assigned Date
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
          <InputGroup style={{ width: "250px" }}>
            <FormControl type="search" placeholder="Search" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
            <Button style={{ backgroundColor: "#FFF", borderColor: "#ced4da" }}>
              <BsSearch style={{ color: "#000", marginBottom: "3px" }} onClick={onSearchClick} />
            </Button>
          </InputGroup>

          <Link to="/assignment/new">
            <Button variant="danger">Create new Assignment</Button>
          </Link>
        </div>
        <Table
          style={{
            width: "1100px",
            height: "400px",
          }}
        >
          <thead>
            <tr>
              <th style={{ width: "70px", padding: "0" }}>
                No.
                <GoTriangleDown
                  style={{
                    marginLeft: "5px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setIsAscending(!isAscending);
                    setSortBy("no.");
                    setAfterCreated("false");
                    setAfterUpdated("false");
                  }}
                ></GoTriangleDown>
              </th>
              <th style={{ width: "140px", padding: "0" }}>
                Asset Code
                <GoTriangleDown
                  style={{ marginLeft: "5px", cursor: "pointer" }}
                  onClick={() => {
                    setIsAscending(!isAscending);
                    setSortBy("assetCode");
                    setAfterCreated("false");
                    setAfterUpdated("false");
                  }}
                ></GoTriangleDown>
              </th>
              <th style={{ width: "140px", padding: "0" }}>
                Asset Name
                <GoTriangleDown
                  style={{ marginLeft: "5px", cursor: "pointer" }}
                  onClick={() => {
                    setIsAscending(!isAscending);
                    setSortBy("assetName");
                    setAfterCreated("false");
                    setAfterUpdated("false");
                  }}
                ></GoTriangleDown>
              </th>
              <th style={{ width: "140px", padding: "0" }}>
                Assigned To
                <GoTriangleDown
                  style={{ marginLeft: "5px", cursor: "pointer" }}
                  onClick={() => {
                    setIsAscending(!isAscending);
                    setSortBy("assignedTo");
                    setAfterCreated("false");
                    setAfterUpdated("false");
                  }}
                ></GoTriangleDown>
              </th>
              <th style={{ width: "140px", padding: "0" }}>
                Assigned By
                <GoTriangleDown
                  style={{ marginLeft: "5px", cursor: "pointer" }}
                  onClick={() => {
                    setIsAscending(!isAscending);
                    setSortBy("assignedBy");
                    setAfterCreated("false");
                    setAfterUpdated("false");
                  }}
                ></GoTriangleDown>
              </th>
              <th style={{ width: "155px", padding: "0" }}>
                Assigned Date
                <GoTriangleDown
                  style={{ marginLeft: "5px", cursor: "pointer" }}
                  onClick={() => {
                    setIsAscending(!isAscending);
                    setSortBy("assignedDate");
                    setAfterCreated("false");
                    setAfterUpdated("false");
                  }}
                ></GoTriangleDown>
              </th>
              <th style={{ width: "200px", padding: "0" }}>
                State
                <GoTriangleDown
                  style={{
                    marginLeft: "5px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setIsAscending(!isAscending);
                    setSortBy("state");
                    setAfterCreated("false");
                    setAfterUpdated("false");
                  }}
                ></GoTriangleDown>
              </th>
              <th style={{ width: "140px", padding: "0" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {assignments &&
              assignments.map((assignment) => (
                <tr>
                  <td
                    onClick={() => {
                      setIsShowDetail(true);
                      setDetailId(assignment.ordinal);
                    }}
                    style={{ cursor: "pointer", width: "62px" }}
                  >
                    {assignment.ordinal}
                  </td>
                  <td
                    onClick={() => {
                      setIsShowDetail(true);
                      setDetailId(assignment.id);
                    }}
                    style={{ cursor: "pointer", width: "140px" }}
                  >
                    {assignment.assetCode}
                  </td>
                  <td
                    onClick={() => {
                      setIsShowDetail(true);
                      setDetailId(assignment.id);
                    }}
                    style={{ cursor: "pointer", width: "140px" }}
                  >
                    {assignment.assetName}
                  </td>
                  <td
                    onClick={() => {
                      setIsShowDetail(true);
                      setDetailId(assignment.id);
                    }}
                    style={{ cursor: "pointer", width: "140px" }}
                  >
                    {assignment.assignedToName}
                  </td>
                  <td
                    onClick={() => {
                      setIsShowDetail(true);
                      setDetailId(assignment.id);
                    }}
                    style={{ cursor: "pointer", width: "140px" }}
                  >
                    {assignment.assignedByName}
                  </td>
                  <td
                    onClick={() => {
                      setIsShowDetail(true);
                      setDetailId(assignment.id);
                    }}
                    style={{ cursor: "pointer", width: "155px" }}
                  >
                    {formatDate(assignment.assignedDate)}
                  </td>
                  <td
                    onClick={() => {
                      setIsShowDetail(true);
                      setDetailId(assignment.id);
                    }}
                    style={{ cursor: "pointer", width: "200px" }}
                  >
                    {StateToString(assignment.state)}
                  </td>
                  <td>
                    <Link
                      to={{
                        pathname: `${StateToString(assignment.state) !== "Waiting For Acceptance" ? "/assignments" : "/assignments/" + assignment.id}`,
                      }}
                    >
                      <MdEdit
                        style={{
                          color: `${StateToString(assignment.state) !== "Waiting For Acceptance" ? "#808080" : "#000"}`,
                          fontSize: "20px",
                          cursor: `${StateToString(assignment.state) !== "Waiting For Acceptance" ? "default" : "pointer"}`,
                        }}
                      />
                    </Link>
                    <CgCloseO
                      onClick={() => {
                        if (StateToString(assignment.state) === "Waiting For Acceptance") {
                          setIdDeletingAssignment(assignment.id);
                          setIsDeleting(true);
                        }
                      }}
                      style={{
                        marginLeft: "5px",
                        color: `${StateToString(assignment.state) !== "Waiting For Acceptance" ? "#f2a7ac" : "#dc3545"}`,
                        fontSize: "20px",
                        cursor: `${StateToString(assignment.state) !== "Waiting For Acceptance" ? "default" : "pointer"}`,
                      }}
                    />
                    <IoReloadOutline
                      onClick={() => {
                        if (StateToString(assignment.state) === "Accepted") {
                          setIdDeletingAssignment(assignment.id);
                          setIsCreated(true);
                        }
                      }}
                      style={{
                        fontWeight: "bold",
                        color: `${StateToString(assignment.state) === "Accepted" ? "#095ee6" : "#999999"}`,
                        marginLeft: "5px",
                        fontSize: "20px",
                        cursor: `${StateToString(assignment.state) !== "Accepted" ? "default" : "pointer"}`,
                      }}
                    />
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            width: "1100px",
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
            Detailed Assigment Information
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
              {detailedAssignment.code}
            </Form.Label>
          </Row>
          <br />
          <Row style={{ display: "inline" }}>
            <Form.Label column="sm" lg={4}>
              Asset name
            </Form.Label>

            <Form.Label column="sm" lg={8}>
              {detailedAssignment.name}
            </Form.Label>
          </Row>
          <br />
          <Row style={{ display: "inline" }}>
            <Form.Label column="sm" lg={4}>
              Specification
            </Form.Label>

            <Form.Label column="sm" lg={8}>
              {detailedAssignment.specification}
            </Form.Label>
          </Row>
          <br />
          <Row style={{ display: "inline" }}>
            <Form.Label column="sm" lg={4}>
              Assigned By
            </Form.Label>

            <Form.Label column="sm" lg={8}>
              {detailedAssignment.AssignedBy}
            </Form.Label>
          </Row>
          <br />
          <Row style={{ display: "inline" }}>
            <Form.Label column="sm" lg={4}>
              Assigned To
            </Form.Label>

            <Form.Label column="sm" lg={8}>
              {detailedAssignment.AssignedTo}
            </Form.Label>
          </Row>
          <br />
          <Row style={{ display: "inline" }}>
            <Form.Label column="sm" lg={4}>
              Assigned Date
            </Form.Label>

            <Form.Label column="sm" lg={8}>
              {detailedAssignment.AssignedDate}
            </Form.Label>
          </Row>
          <br />
          <Row style={{ display: "inline" }}>
            <Form.Label column="sm" lg={4}>
              State
            </Form.Label>
            <Form.Label column="sm" lg={8}>
              {detailedAssignment.state}
            </Form.Label>
          </Row>
          <br />
          <Row style={{ display: "inline" }}>
            <Form.Label column="sm" lg={4}>
              Note
            </Form.Label>
            <Form.Label column="sm" lg={8}>
              {detailedAssignment.note}
            </Form.Label>
          </Row>
          <br />
        </Modal.Body>
      </Modal>
      <Modal show={isDeleting} centered>
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
          <p>Do you want to delete this assignment</p>
        </Modal.Body>

        <Modal.Footer style={{ justifyContent: "flex-start", marginLeft: "20px" }}>
          <Button
            style={{
              backgroundColor: "#dc3545",
              border: "1px solid #dc3545",
              borderRadius: "4px",
            }}
            onClick={(e) => handleDelete(e)}
          >
            Delete
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
              setIsDeleting(false);
            }}
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={isCreated} centered>
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
          <p>Do you want to create a returning request for this asset?</p>
        </Modal.Body>

        <Modal.Footer style={{ justifyContent: "flex-start", marginLeft: "20px" }}>
          <Button
            style={{
              backgroundColor: "#dc3545",
              border: "1px solid #dc3545",
              borderRadius: "4px",
            }}
            onClick={handleCreated}
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
              setIsCreated(false);
            }}
          >
            No
          </Button>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
};

export default ListAssignments;
