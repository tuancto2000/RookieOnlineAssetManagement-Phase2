import React, { useState, useEffect } from "react";
import { Table, Modal, Button, FormControl, InputGroup } from "react-bootstrap";
import { BsSearch } from "react-icons/bs";
import { GoTriangleDown } from "react-icons/go";
import userService from "../../services/user.service";
import ReactPaginate from "react-paginate";
import "./style.css";

const SelectUsers = (props) => {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState(props.label);
  const [selectedUserId, setSelectedUserId] = useState(props.value);
  const [isFilter, setIsFilter] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [isAscending, setIsAscending] = useState(true);
  const [sortBy, setSortBy] = useState("code");
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState();
  const [searchFilterModel, setSearchFilterModel] = useState({});

  const handleSearch = () => {
    setIsSearch(true);
    setCurrentPage(1);
  };

  const handlePageChange = (event) => {
    setCurrentPage(event.selected + 1);
  };

  const handleSave = () => {
    props.setValue(selectedUserId);
    props.setLabel(name);
    props.setIsOpenSelectUsers(false);
  };

  useEffect(() => {
    if (selectedUserId !== 0 && users.length > 0) {
      setName(
        users.filter((x) => x.id == selectedUserId)[0].firstName +
          " " +
          users.filter((x) => x.id == selectedUserId)[0].lastName
      );
    }
  }, [selectedUserId]);

  useEffect(() => {
    setSearchFilterModel({
      ...searchFilterModel,
      keyword: keyword,
      sortBy: sortBy,
      isAscending: isAscending,
      pageIndex: currentPage,
    });
    setIsFilter(true);
  }, [isSearch, sortBy, isAscending]);

  //Pagination only
  useEffect(() => {
    setSearchFilterModel({
      ...searchFilterModel,
      pageIndex: currentPage,
    });
    setIsFilter(true);
  }, [currentPage]);

  useEffect(() => {
    userService
      .getUsersPagingFilter(searchFilterModel)
      .then((response) => {
        setUsers(response.data.items);
        setIsFilter(false);
        setIsSearch(false);
        setTotalPages(response.data.pageCount);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [isFilter]);

  return (
    <Modal dialogClassName="custom-modal" show={props.isOpenSelectUsers}>
      <Modal.Body style={{ padding: "20px" }}>
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                color: "#dc3545",
                fontSize: "20px",
                fontWeight: "bold",
              }}
            >
              Select User
            </div>
            <InputGroup style={{ width: "300px" }}>
              <FormControl type="search" placeholder="Search" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
              <Button style={{ backgroundColor: "#FFF", borderColor: "#ced4da" }}>
                <BsSearch style={{ color: "#000", marginBottom: "3px" }} onClick={handleSearch} />
              </Button>
            </InputGroup>
          </div>
          <Table style={{ height: "460px" }}>
            <thead>
              <tr>
                <th style={{ width: "50px" }}></th>
                <th>
                  Staff Code
                  <GoTriangleDown
                    style={{ marginLeft: "5px", cursor: "pointer" }}
                    onClick={() => {
                      setIsAscending(!isAscending);
                      setSortBy("code");
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
                    }}
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {users &&
                users.map((user) => (
                  <tr key={user.id}>
                    <td style={{ width: "50px" }}>
                      <label className="wrap-radio">
                        <input
                          type="radio"
                          value={user.id}
                          name="userId"
                          onChange={(e) => setSelectedUserId(e.target.value)}
                          checked={user.id == selectedUserId ? true : false}
                        />
                        <span className="checkmark-radio"></span>
                      </label>
                    </td>
                    <td>{user.code}</td>
                    <td>{user.firstName + " " + user.lastName}</td>
                    <td>{user.type == 1 ? "Staff" : "Admin"}</td>
                  </tr>
                ))}
            </tbody>
          </Table>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              width: "100%",
              marginTop: "10px",
              marginBottom: "20px",
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
          <div style={{ display: "flex", justifyContent: "end" }}>
            <Button
              style={{
                backgroundColor: "#dc3545",
                border: "1px solid #dc3545",
                borderRadius: "4px",
                marginRight: "20px",
              }}
              onClick={handleSave}
              disabled={selectedUserId == 0 ? true : false}
            >
              Save
            </Button>
            <Button
              style={{
                backgroundColor: "#FFF",
                border: "1px solid #808080",
                borderRadius: "4px",
                color: "#808080",
              }}
              onClick={() => props.setIsOpenSelectUsers(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default SelectUsers;
