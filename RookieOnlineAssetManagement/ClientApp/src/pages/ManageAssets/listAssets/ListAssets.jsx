import React from "react";
import "./ListAssets.css";
import { Modal, Table, Button, FormControl, InputGroup, Row, Form } from "react-bootstrap";
import { MdEdit, MdOutlineCancelPresentation } from "react-icons/md";
import { CgCloseO } from "react-icons/cg";
import { useState, useEffect } from "react";
import { Link, useLocation, useHistory } from "react-router-dom";
import { GetAssetsPagingDefault, GetAssetState, GetAllCategories, Delete, GetAssetsPagingFilter, GetDetail } from "../../../services/assetService";
import { MultiSelect } from "react-multi-select-component";
import { HiFilter } from "react-icons/hi";
import { BsSearch } from "react-icons/bs";
import { GoTriangleDown } from "react-icons/go";
import ReactPaginate from "react-paginate";
import queryString from "query-string";
const ListAssets = () => {
  const { search } = useLocation();
  const params = queryString.parse(search);
  const [afterCreated, setAfterCreated] = useState(params.IsSortByCreatedDate);
  const [afterUpdated, setAfterUpdated] = useState(params.IsSortByUpdatedDate);
  const [states, setStates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedState, setSelectedState] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [assets, setAssets] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingError, setIsDeletingError] = useState(false);
  const [idDeletingAsset, setIdDeletingAsset] = useState();
  const [isFilter, setIsFilter] = useState(false);
  const [searchFilterModel, setSearchFilterModel] = useState({ sortBy: "code" });
  const [keyword, setKeyword] = useState();
  const [isSearch, setIsSearch] = useState(false);
  const [isAscending, setIsAscending] = useState();
  const [sortBy, setSortBy] = useState("code");
  const [totalPages, setTotalPages] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [detailId, setDetailId] = useState();
  const [isShowDetail, setIsShowDetail] = useState(false);
  const [detailedAsset, setDetailedAsset] = useState({
    id: detailId,
    code: "",
    name: "",
    category: "",
    installedDate: null,
    state: "",
    location: "",
    specification: "",
    history: [],
  });
  const history = useHistory();
  const formatDate = (date) => {
    var d = new Date(date),
      month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [month, day, year].join("/");
  };
  useEffect(() => {
    GetAssetState()
      .then((response) => {
        const arrState = response.map((x) => ({
          value: x.value,
          label: x.name,
        }));
        setStates(arrState);
        setSelectedState(arrState.filter((a) => a.value === 0 || a.value === 1 || a.value === 2));
      })
      .catch((error) => console.log(error));

    GetAllCategories()
      .then((response) => {
        const arrCategory = response.map((x) => ({
          id: x.id,
          value: x.code,
          label: x.name,
        }));
        setCategories(arrCategory);
        setSelectedCategory(arrCategory.filter((x) => x.id));
      })
      .catch((error) => console.log(error));

    GetAssetsPagingDefault(afterCreated, afterUpdated)
      .then((response) => {
        setAssets([...response.items]);
        setTotalPages(response.pageCount);
      })
      .catch((error) => console.log(error));
    history.replace("/assets");
  }, []);
  useEffect(() => {
    setSearchFilterModel({
      ...searchFilterModel,
      isAscending: isAscending,
      sortBy: sortBy,
      keyword: keyword,
      statesFilter: selectedState.map((s) => s.value).toString(),
      categoriesFilter: selectedCategory.map((s) => s.id).toString(),
      IsSortByCreatedDate: afterCreated,
      IsSortByUpdatedDate: afterUpdated,
      pageIndex: currentPage,
    });
    setIsFilter(true);
  }, [selectedState, selectedCategory, isSearch, sortBy, isAscending]);

  //Pagination only
  useEffect(() => {
    setSearchFilterModel({
      ...searchFilterModel,
      pageIndex: currentPage,
    });
    setIsFilter(true);
  }, [currentPage]);

  useEffect(() => {
    GetAssetsPagingFilter(searchFilterModel)
      .then((response) => {
        setAssets([...response.items]);
        setIsFilter(false);
        setIsSearch(false);
        setTotalPages(response.pageCount);
      })
      .catch((error) => console.log(error));
  }, [isFilter]);
  const StateToString = (state) => {
    switch (state) {
      case 0:
        return "Available";
        break;
      case 1:
        return "Not Available";
        break;
      case 2:
        return "Assigned";
        break;
      case 3:
        return "Waiting For Recycling";
        break;
      case 4:
        return "Recycled";
        break;
      default:
        return "Unknown";
        break;
    }
  };
  const handleDelete = () => {
    var asset = assets.find((a) => a.id === idDeletingAsset);
    if (asset.histories === null) {
      Delete(idDeletingAsset)
        .then((res) => {
          GetAssetsPagingFilter(searchFilterModel)
            .then((response) => setAssets([...response.items]))
            .catch((error) => console.log(error));
        })
        .catch((error) => {
          setIsDeleting(false);
          setIsDeletingError(true);
        });
      setIsDeleting(false);
    } else {
      setIsDeleting(false);
      setIsDeletingError(true);
    }
  };
  const onSearchClick = () => {
    setIsSearch(true);
    setCurrentPage(1);
  };
  const handlePageChange = (event) => {
    setCurrentPage(event.selected + 1);
  };
  useEffect(() => {
    GetDetail(detailId).then((res) => {
      setDetailedAsset({
        ...detailedAsset,
        id: res.id,
        code: res.code,
        name: res.name,
        category: res.category.name,
        installedDate: formatDate(res.installedDate),
        state: StateToString(res.state),
        location: res.location,
        specification: res.specification,
        history: res.histories,
      });
    });
  }, [detailId]);
  useEffect(() => {
    console.log(detailedAsset.history);
  }, [detailedAsset]);
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
          Asset List
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "1000px",
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

          <div style={{ width: "200px" }}>
            <MultiSelect
              options={categories}
              value={selectedCategory}
              onChange={setSelectedCategory}
              labelledBy="Category"
              disableSearch={true}
              valueRenderer={() => "Category"}
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

          <InputGroup style={{ width: "250px" }}>
            <FormControl type="search" placeholder="Search" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
            <Button style={{ backgroundColor: "#FFF", borderColor: "#ced4da" }}>
              <BsSearch style={{ color: "#000", marginBottom: "3px" }} onClick={onSearchClick} />
            </Button>
          </InputGroup>

          <Link to="/asset/new">
            <Button variant="danger">Create new asset</Button>
          </Link>
        </div>
        <div>
          <Table
            style={{
              width: "1000px",
              height: "400px",
              overflow: "auto",
            }}
          >
            <thead>
              <tr>
                <th style={{ width: "15%" }}>
                  Asset Code
                  <GoTriangleDown
                    style={{ marginLeft: "5px", cursor: "pointer" }}
                    onClick={() => {
                      setIsAscending(!isAscending);
                      setSortBy("code");
                      setAfterCreated("false");
                      setAfterUpdated("false");
                    }}
                  ></GoTriangleDown>
                </th>
                <th>
                  Asset Name
                  <GoTriangleDown
                    style={{ marginLeft: "5px", cursor: "pointer" }}
                    onClick={() => {
                      setIsAscending(!isAscending);
                      setSortBy("name");
                      setAfterCreated("false");
                      setAfterUpdated("false");
                    }}
                  ></GoTriangleDown>
                </th>
                <th>
                  Category
                  <GoTriangleDown
                    style={{ marginLeft: "5px", cursor: "pointer" }}
                    onClick={() => {
                      setIsAscending(!isAscending);
                      setSortBy("category");
                      setAfterCreated("false");
                      setAfterUpdated("false");
                    }}
                  ></GoTriangleDown>
                </th>
                <th>
                  State
                  <GoTriangleDown
                    style={{ marginLeft: "5px", cursor: "pointer" }}
                    onClick={() => {
                      setIsAscending(!isAscending);
                      setSortBy("state");
                      setAfterCreated("false");
                      setAfterUpdated("false");
                    }}
                  ></GoTriangleDown>
                </th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {assets &&
                assets.map((asset) => (
                  <tr>
                    <td
                      onClick={() => {
                        setIsShowDetail(true);
                        setDetailId(asset.id);
                      }}
                      style={{ cursor: "pointer", width: "15.2%" }}
                    >
                      {asset.code}
                    </td>
                    <td
                      onClick={() => {
                        setIsShowDetail(true);
                        setDetailId(asset.id);
                      }}
                      style={{ cursor: "pointer", width: "21.7%" }}
                    >
                      {asset.name}
                    </td>
                    <td
                      onClick={() => {
                        setIsShowDetail(true);
                        setDetailId(asset.id);
                      }}
                      style={{ cursor: "pointer", width: "21.5%" }}
                    >
                      {" "}
                      {asset.category.name}
                    </td>
                    <td
                      onClick={() => {
                        setIsShowDetail(true);
                        setDetailId(asset.id);
                      }}
                      style={{ cursor: "pointer", width: "21.5%" }}
                    >
                      {StateToString(asset.state)}
                    </td>
                    <td>
                      <Link
                        to={{
                          pathname: `${StateToString(asset.state) === "Assigned" ? "/assets" : "/asset/edit/" + asset.id}`,
                        }}
                      >
                        <MdEdit
                          style={{
                            color: `${StateToString(asset.state) === "Assigned" ? "#808080" : "#000"}`,
                            fontSize: "20px",
                            marginRight: "20px",
                            cursor: `${StateToString(asset.state) === "Assigned" ? "default" : "pointer"}`,
                          }}
                        />
                      </Link>
                      <CgCloseO
                        onClick={() => {
                          if (StateToString(asset.state) !== "Assigned") {
                            setIdDeletingAsset(asset.id);
                            setIsDeleting(true);
                          }
                        }}
                        style={{
                          color: `${StateToString(asset.state) === "Assigned" ? "#f2a7ac" : "#dc3545"}`,
                          fontSize: "20px",
                          cursor: `${StateToString(asset.state) === "Assigned" ? "default" : "pointer"}`,
                        }}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            width: "1000px",
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
            Detailed Asset Information
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
            <Form.Label column="sm" lg={3}>
              Asset Code
            </Form.Label>

            <Form.Label column="sm" lg={9}>
              {detailedAsset.code}
            </Form.Label>
          </Row>
          <br />
          <Row style={{ display: "inline" }}>
            <Form.Label column="sm" lg={3}>
              Asset name
            </Form.Label>

            <Form.Label column="sm" lg={9}>
              {detailedAsset.name}
            </Form.Label>
          </Row>
          <br />
          <Row style={{ display: "inline" }}>
            <Form.Label column="sm" lg={3}>
              Category
            </Form.Label>

            <Form.Label column="sm" lg={9}>
              {detailedAsset.category}
            </Form.Label>
          </Row>
          <br />
          <Row style={{ display: "inline" }}>
            <Form.Label column="sm" lg={3}>
              Installed Date
            </Form.Label>

            <Form.Label column="sm" lg={9}>
              {detailedAsset.installedDate}
            </Form.Label>
          </Row>
          <br />
          <Row style={{ display: "inline" }}>
            <Form.Label column="sm" lg={3}>
              State
            </Form.Label>

            <Form.Label column="sm" lg={9}>
              {detailedAsset.state}
            </Form.Label>
          </Row>
          <br />
          <Row style={{ display: "inline" }}>
            <Form.Label column="sm" lg={3}>
              Location
            </Form.Label>

            <Form.Label column="sm" lg={9}>
              {detailedAsset.location}
            </Form.Label>
          </Row>
          <br />
          <Row style={{ display: "inline" }}>
            <Form.Label column="sm" lg={3}>
              Specification
            </Form.Label>
            <Form.Label column="sm" lg={9}>
              {detailedAsset.specification}
            </Form.Label>
          </Row>
          <br />
          {detailedAsset.history === null ? (
            <Row style={{ display: "inline" }}>
              <Form.Label column="sm" lg={3}>
                History
              </Form.Label>

              <Form.Label column="sm" lg={9}>
                This Asset doesn't has any assignment history
              </Form.Label>
            </Row>
          ) : (
            <div>
              <Form.Label column="sm" lg={3}>
                History
              </Form.Label>
              <Table style={{ fontSize: ".875rem" }}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Assigned to</th>
                    <th>Assigned by</th>
                    <th>Returned</th>
                  </tr>
                </thead>
                <tbody>
                  {detailedAsset.history &&
                    detailedAsset.history.map((historyItem) => (
                      <tr>
                        <td>{formatDate(historyItem.assignedDate)}</td>
                        <td>{historyItem.assignedTo}</td>
                        <td>{historyItem.assignedBy}</td>
                        <td>{formatDate(historyItem.returnedDate)}</td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </div>
          )}

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
            Are you sure?
          </Modal.Title>
        </Modal.Header>

        <Modal.Body
          style={{
            marginLeft: "20px",
          }}
        >
          <p>Do you want to delete this asset</p>
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
      <Modal show={isDeletingError} centered>
        <Modal.Header style={{ backgroundColor: "#DDE1E5" }}>
          <Modal.Title
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#dc3545",
              marginLeft: "20px",
            }}
          >
            Cannot Delete Asset
          </Modal.Title>
          <MdOutlineCancelPresentation
            onClick={() => {
              setIsDeletingError(false);
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
            display: "inline",
          }}
        >
          <p
            style={{
              display: "inline",
            }}
          >
            Cannot delete the asset because it belongs to one or more historical assignments.
            <br />
            If the asset is not able to be used anymore, please update its state in&nbsp;
            <Link
              style={{
                display: "inline",
              }}
              to={{
                pathname: `${"/asset/edit/" + idDeletingAsset}`,
              }}
            >
              Edit Asset Page
            </Link>
          </p>
        </Modal.Body>
      </Modal>
    </React.Fragment>
  );
};

export default ListAssets;
