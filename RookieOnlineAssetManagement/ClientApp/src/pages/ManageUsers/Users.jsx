import React, { useEffect, useState } from "react";
import { Table, Button, Modal, FormControl, InputGroup, Row, Form } from "react-bootstrap";
import { MdEdit, MdOutlineCancelPresentation } from "react-icons/md";
import { CgCloseO } from "react-icons/cg";
import { Link, useLocation, useHistory } from "react-router-dom";
import ReactPaginate from "react-paginate";

import { MultiSelect } from "react-multi-select-component";
import { HiFilter } from "react-icons/hi";
import { BsSearch } from "react-icons/bs";
import queryString from "query-string";
import { GoTriangleDown } from "react-icons/go";
import userService from "../../services/user.service";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingError, setIsDeletingError] = useState(false);
  const [idDeletingUser, setIdDeletingUser] = useState();
  const history = useHistory();
  const { search } = useLocation();
  const params = queryString.parse(search);
  const [afterCreated, setAfterCreated] = useState(params.IsSortByCreatedDate);
  const [afterUpdated, setAfterUpdated] = useState(params.IsSortByUpdatedDate);
  const [isFilter, setIsFilter] = useState(false);
  const [searchFilterModel, setSearchFilterModel] = useState({});
  const [keyword, setKeyword] = useState();
  const [isSearch, setIsSearch] = useState(false);
  const [isAscending, setIsAscending] = useState();
  const [sortBy, setSortBy] = useState("code");
  const [detailId, setDetailId] = useState(0);
  const [detailedUser, setDetailedUser] = useState({});

  const [selected, setSelected] = useState([]);

  console.log(afterCreated);
  console.log(afterUpdated);
  // Pagination

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState();

  const handlePageChange = (event) => {
    setCurrentPage(event.selected + 1);
  };

  useEffect(() => {
    userService
      .getUsersPagingDefault(afterCreated, afterUpdated)
      .then((response) => {
        setUsers(response.data.items);
        setTotalPage(response.data.pageCount);
      })
      .catch((e) => {
        console.log(e);
      });
    history.replace("/users");
  }, []);

  useEffect(() => {
    setSearchFilterModel({
      ...searchFilterModel,
      keyword: keyword,
      typeFilter: selected.map((s) => s.value).toString(),
      IsSortByCreatedDate: afterCreated,
      IsSortByUpdatedDate: afterUpdated,
      sortBy: sortBy,
      pageIndex: currentPage,
      isAscending: isAscending,
    });
    setIsFilter(true);
  }, [selected, isSearch, sortBy, isAscending]);

  //Pagination only
  useEffect(() => {
    setSearchFilterModel({
      ...searchFilterModel,
      IsSortByCreatedDate: afterCreated,
      IsSortByUpdatedDate: afterUpdated,
      pageIndex: currentPage,
    });
    setIsFilter(true);
  }, [currentPage]);

  useEffect(() => {
    userService
      .getUsersPagingFilter(searchFilterModel)
      .then((response) => {
        setUsers(response.data.items);
        setTotalPage(response.data.pageCount);
        setIsFilter(false);
        setIsSearch(false);
      })
      .catch((error) => console.log(error));
  }, [isFilter]);

  const handleDisabled = () => {
    var user = users.find((a) => a.id === idDeletingUser);
    userService
      .disabled(user.id)
      .then((response) => {
        setIsDeleting(false);
        setIsFilter(true);
      })
      .catch((e) => {
        setIsDeleting(false);
        setIsDeletingError(true);
      });
  };

  useEffect(() => {
    if (detailId !== 0) {
      userService.getUser(detailId).then((response) => {
        setDetailedUser(response.data);
      });
    }
  }, [detailId]);

  const options = [
    { label: "Staff", value: "1" },
    { label: "Admin", value: "2" },
  ];

  const handleSearch = () => {
    setIsSearch(true);
    setCurrentPage(1);
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
          User List
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "1000px",
            paddingBottom: "20px",
          }}
        >
          <div style={{ width: "200px" }}>
            <MultiSelect
              options={options}
              value={selected}
              onChange={setSelected}
              labelledBy="Type"
              disableSearch={true}
              valueRenderer={() => "Type"}
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
              <BsSearch style={{ color: "#000", marginBottom: "3px" }} onClick={handleSearch} />
            </Button>
          </InputGroup>
          <Link to="/users/add">
            <Button variant="danger">Create New User</Button>
          </Link>
        </div>
        <Table
          style={{
            width: "1000px",
            height: "400px",
          }}
        >
          <thead>
            <tr>
              <th>
                Staff Code
                <GoTriangleDown
                  style={{ marginLeft: "5px", cursor: "pointer" }}
                  onClick={() => {
                    setIsAscending(!isAscending);
                    setSortBy("code");
                    setAfterCreated("false");
                    setAfterUpdated("false");
                  }}
                />
              </th>
              <th>
                Full Name
                <GoTriangleDown
                  style={{ marginLeft: "5px", cursor: "pointer" }}
                  onClick={() => {
                    setIsAscending(!isAscending);
                    setSortBy("fullName");
                    setAfterCreated("false");
                    setAfterUpdated("false");
                  }}
                />
              </th>
              <th>
                Username
                <GoTriangleDown
                  style={{ marginLeft: "5px", cursor: "pointer" }}
                  onClick={() => {
                    setIsAscending(!isAscending);
                    setSortBy("userName");
                    setAfterCreated("false");
                    setAfterUpdated("false");
                  }}
                />
              </th>
              <th>
                Joined Date
                <GoTriangleDown
                  style={{ marginLeft: "5px", cursor: "pointer" }}
                  onClick={() => {
                    setIsAscending(!isAscending);
                    setSortBy("joinedDate");
                    setAfterCreated("false");
                    setAfterUpdated("false");
                  }}
                />
              </th>
              <th>
                Type
                <GoTriangleDown
                  style={{ marginLeft: "5px", cursor: "pointer" }}
                  onClick={() => {
                    setIsAscending(!isAscending);
                    setSortBy("type");
                    setAfterCreated("false");
                    setAfterUpdated("false");
                  }}
                />
              </th>
              <th>Action</th>
              <th style={{ width: "2%" }}></th>
            </tr>
          </thead>
          <tbody>
            {users &&
              users.map((user, index) => (
                <tr key={index}>
                  <td
                    onClick={() => {
                      setDetailId(user.id);
                    }}
                    style={{ cursor: "pointer", width: "16.7%" }}
                  >
                    {user.code}
                  </td>
                  <td
                    onClick={() => {
                      setDetailId(user.id);
                    }}
                    style={{ cursor: "pointer", width: "16.7%" }}
                  >
                    {user.firstName} {user.lastName}
                  </td>
                  <td
                    onClick={() => {
                      setDetailId(user.id);
                    }}
                    style={{ cursor: "pointer", width: "16.5%" }}
                  >
                    {user.userName}
                  </td>
                  <td
                    onClick={() => {
                      setDetailId(user.id);
                    }}
                    style={{ cursor: "pointer", width: "16.7%" }}
                  >
                    {formatDate(user.joinedDate)}
                  </td>
                  <td
                    onClick={() => {
                      setDetailId(user.id);
                    }}
                    style={{ cursor: "pointer", width: "16.5%" }}
                  >
                    {user.type === 1 ? "Staff" : "Admin"}
                  </td>
                  <td>
                    <Link to={`/users/${user.id}`}>
                      <MdEdit
                        style={{
                          color: "#808080",
                          fontSize: "20px",
                          marginRight: "20px",
                          cursor: "pointer",
                        }}
                      />
                    </Link>
                    <CgCloseO
                      onClick={(e) => {
                        setIdDeletingUser(user.id);
                        if (user.isHistory === true) {
                          console.log(user.isHistory);
                          setIsDeletingError(true);
                        } else {
                          console.log(user.isHistory);
                          setIsDeleting(true);
                        }
                      }}
                      style={{
                        color: "#dc3545",
                        fontSize: "20px",
                        cursor: "pointer",
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
            width: "1000px",
            marginTop: "30px",
          }}
        >
          <ReactPaginate
            pageCount={totalPage}
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
      <Modal show={isDeleting} centered>
        <Modal.Header style={{ backgroundColor: "#DDE1E5" }}>
          <Modal.Title style={{ fontSize: "20px", fontWeight: "bold", color: "#dc3545" }}>Are you sure ?</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>Do you want to disable this user ?</p>
        </Modal.Body>

        <Modal.Footer style={{ justifyContent: "flex-start", marginLeft: "20px" }}>
          <Button
            style={{
              backgroundColor: "#dc3545",
              border: "1px solid #dc3545",
              borderRadius: "4px",
            }}
            onClick={() => handleDisabled()}
          >
            Disable
          </Button>
          <Button
            style={{
              backgroundColor: "#FFF",
              border: "1px solid #808080",
              borderRadius: "4px",
              color: "#808080",
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
        <Modal.Header style={{ backgroundColor: "#DDE1E5", paddingLeft: "40px" }}>
          <Modal.Title style={{ fontSize: "20px", fontWeight: "bold", color: "#dc3545" }}>Can not disable user</Modal.Title>
          <CgCloseO onClick={() => setIsDeletingError(false)} style={{ color: "#dc3545", fontSize: "20px", cursor: "pointer" }} />
        </Modal.Header>

        <Modal.Body style={{ padding: "20px", paddingLeft: "40px" }}>
          <p>There are valid assignments belonging to this user. Please close all assignments before disabling user.</p>
        </Modal.Body>
      </Modal>

      <Modal centered dialogClassName="modal-90w" show={detailId !== 0}>
        <Modal.Header style={{ backgroundColor: "#DDE1E5" }}>
          <Modal.Title
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#dc3545",
              marginLeft: "20px",
            }}
          >
            Detailed User Information
          </Modal.Title>
          <MdOutlineCancelPresentation
            onClick={() => {
              setDetailId(0);
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
              Staff Code
            </Form.Label>

            <Form.Label column="sm" lg={9}>
              {detailedUser.code}
            </Form.Label>
          </Row>
          <br />
          <Row style={{ display: "inline" }}>
            <Form.Label column="sm" lg={3}>
              Full Name
            </Form.Label>

            <Form.Label column="sm" lg={9}>
              {detailedUser.firstName} {detailedUser.lastName}
            </Form.Label>
          </Row>
          <br />
          <Row style={{ display: "inline" }}>
            <Form.Label column="sm" lg={3}>
              Username
            </Form.Label>

            <Form.Label column="sm" lg={9}>
              {detailedUser.userName}
            </Form.Label>
          </Row>
          <br />
          <Row style={{ display: "inline" }}>
            <Form.Label column="sm" lg={3}>
              Date of Birth
            </Form.Label>

            <Form.Label column="sm" lg={9}>
              {formatDate(detailedUser.doB)}
            </Form.Label>
          </Row>
          <br />
          <Row style={{ display: "inline" }}>
            <Form.Label column="sm" lg={3}>
              Gender
            </Form.Label>

            <Form.Label column="sm" lg={9}>
              {detailedUser.gender ? "Female" : "Male"}
            </Form.Label>
          </Row>
          <br />
          <Row style={{ display: "inline" }}>
            <Form.Label column="sm" lg={3}>
              Joined Date
            </Form.Label>

            <Form.Label column="sm" lg={9}>
              {formatDate(detailedUser.joinedDate)}
            </Form.Label>
          </Row>
          <br />
          <Row style={{ display: "inline" }}>
            <Form.Label column="sm" lg={3}>
              Type
            </Form.Label>

            <Form.Label column="sm" lg={9}>
              {detailedUser.type ? "Staff" : "Admin"}
            </Form.Label>
          </Row>
          <br />
          <Row style={{ display: "inline" }}>
            <Form.Label column="sm" lg={3}>
              Location
            </Form.Label>
            <Form.Label column="sm" lg={9}>
              {detailedUser.location}
            </Form.Label>
          </Row>
        </Modal.Body>
      </Modal>
    </React.Fragment>
  );
};

const formatDate = (date) => {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [month, day, year].join("/");
};

export default Users;
