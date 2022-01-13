import React, { useEffect, useState } from "react";
import {
  Create,
  GetAllCategories,
  CreateCategory,
} from "../../../services/assetService";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import { MdOutlineArrowDropDown } from "react-icons/md";
import { BsCheckLg } from "react-icons/bs";
import { ImCross } from "react-icons/im";
import { Modal, Button } from "react-bootstrap";
export default function NewAsset(props) {
  let history = useHistory();
  const [categoryCreated, setCategoryCreated] = useState(false);
  const [categories, setCategories] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isError, setIsError] = useState(false);
  useEffect(() => {
    GetAllCategories()
      .then((response) => {
        setCategories([...response]);
        setCategoryCreated(false);
      })
      .catch((error) => console.log(error));
  }, [categoryCreated]);
  const {
    register,
    handleSubmit,
    formState: { isDirty, isValid },
  } = useForm({ mode: "onChange" });
  const onHandleSubmit = (data) => {
    console.log(data);
    console.log("Id", categoryId);
    console.log("name", categoryName);
    const fd = new FormData();
    for (var key in data) {
      fd.append(key, data[key]);
    }
    fd.append("categoryId", categoryId);
    Create(fd)
      .then((response) => {
        if (response.status) {
          console.log(response);
          history.push("/assets?IsSortByCreatedDate=true");
        }
      })
      .catch((error) => console.log(error));

    console.log(fd);
  };
  const onCreateCategory = (newCategory) => {
    var isExistName =
      categories.find((c) => c.name === newCategory) !== undefined;
    if (isExistName) {
      setErrorMessage(
        "Category is already existed. Please enter a different category"
      );
      return setIsError(true);
    }
    var isExistPrefix =
      categories.find((c) => c.code === categoryPrefix) !== undefined;
    if (isExistPrefix) {
      setErrorMessage(
        "Prefix is already existed. Please enter a different prefix"
      );
      return setIsError(true);
    }

    const fd = new FormData();
    fd.append("categoryName", newCategory);
    CreateCategory(fd)
      .then((response) => {
        setCategoryCreated(true);
        setIsShow(false);
        setCategoryDisplay(newCategory);
        setCategoryId(response.data);
        setCategoryName("");
      })
      .catch((error) => console.log(error));
  };
  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [categoryPrefix, setCategoryPrefix] = useState("");
  const [isShow, setIsShow] = useState(false);
  const [isAddCategory, setIsAddCategory] = useState(false);
  const [categoryDisplay, setCategoryDisplay] = useState("");

  useEffect(() => {
    if (categoryName !== "") {
      var matches = categoryName.match(/\b(\w)/g);
      var newPrefix =
        matches.length === 1
          ? categoryName.substring(0, 2).toUpperCase()
          : matches.join("").toUpperCase();
      setCategoryPrefix(newPrefix);
    } else {
      setCategoryPrefix("");
    }
  }, [categoryName]);
  return (
    <div className="container">
      <div class="mx-auto">
        <h1
          style={{
            color: "#dc3545",
            fontSize: "25px",
            fontWeight: "bold",
            marginTop: "25px",
            marginBottom: "25px",
          }}
        >
          Create New Asset
        </h1>
        <form onSubmit={handleSubmit(onHandleSubmit)}>
          <div class="form-group row my-3">
            <label htmlFor="name" class="col-sm-2 col-form-label">
              Name
            </label>
            <div class="col-sm-4">
              <input
                type="text"
                class="form-control"
                {...register("name", { required: true })}
              />
            </div>
          </div>

          <div class="form-group row my-3">
            <label htmlFor="name" class="col-sm-2 col-form-label">
              Category
            </label>

            <div class="col-sm-4">
              <div>
                <Dropdown
                  onToggle={() => {
                    setIsShow(!isShow);
                    setIsAddCategory(false);
                  }}
                  show={isShow}
                  collapseOnSel
                  autoClose={false}
                >
                  <Dropdown.Toggle
                    id="dropdown-basic"
                    style={{
                      width: "100%",
                      backgroundColor: "#FFF",
                      color: "#000",
                      border: "1px solid #ced4da",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span>
                        {categoryDisplay === ""
                          ? "Select or create category"
                          : categoryDisplay}
                      </span>
                      <MdOutlineArrowDropDown />
                    </div>
                  </Dropdown.Toggle>
                  <Dropdown.Menu
                    style={{
                      overflowY: "scroll",
                      height: "200px",
                      width: "100%",
                    }}
                  >
                    {categories &&
                      categories.map((categoryItem) => (
                        <Dropdown.Item
                          onClick={() => {
                            setIsShow(false);
                            setCategoryDisplay(categoryItem.name);
                            setCategoryId(categoryItem.id);
                          }}
                        >
                          {categoryItem.name}
                        </Dropdown.Item>
                      ))}
                    <Dropdown.Divider></Dropdown.Divider>
                    {isAddCategory ? (
                      <Dropdown.Item onClick={() => setIsShow(true)}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <input
                            type="text"
                            id="categoryInput"
                            style={{ width: "50%" }}
                            onChange={(e) => {
                              e.preventDefault();
                              console.log(e.target.value);
                              setCategoryName(e.target.value);
                            }}
                            onKeyDown={(e) => e.stopPropagation()}
                            onKeyUp={(e) => e.stopPropagation()}
                            onKeyPress={(e) => e.stopPropagation()}
                          />
                          <input
                            style={{ width: "20%" }}
                            readOnly
                            value={categoryPrefix}
                          />
                          <BsCheckLg
                            values={{ color: "red" }}
                            onClick={() => {
                              onCreateCategory(categoryName);
                            }}
                            style={{
                              color: "red",
                              cursor: "pointer",
                              marginLeft: "20px",
                            }}
                          />
                          <ImCross
                            values={{ size: "15" }}
                            onClick={() => {
                              setIsShow(!isShow);
                              setIsAddCategory(false);
                              setCategoryName("");
                            }}
                            style={{
                              cursor: "pointer",
                              marginLeft: "20px",
                            }}
                          />
                        </div>
                      </Dropdown.Item>
                    ) : (
                      <Dropdown.Item
                        onClick={() => {
                          setIsAddCategory(true);
                          setIsShow(true);
                        }}
                      >
                        <span style={{ color: "red", cursor: "pointer" }}>
                          Add new category
                        </span>
                      </Dropdown.Item>
                    )}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
          </div>
          <div class="form-group row my-3">
            <label htmlFor="specification" class="col-sm-2 col-form-label">
              Specification
            </label>
            <div class="col-sm-4">
              <textarea
                type="text"
                class="form-control"
                {...register("specification", { required: true })}
              />
            </div>
          </div>
          <div class="form-group row my-3 mt-4">
            <label htmlFor="doB" class="col-sm-2 col-form-label">
              Installed Date
            </label>
            <div class="col-sm-4">
              <input
                type="date"
                class="form-control"
                {...register("installedDate", { required: true })}
              />
            </div>
          </div>
          <div class="form-group row mt-4">
            <label htmlFor="isAvailable" class="col-sm-2 col-form-label">
              State
            </label>
            <div class="col-sm-4">
              <div class="form-check form-check">
                <input
                  class="form-check-input "
                  type="radio"
                  value={true}
                  {...register("isAvailable", { required: true })}
                />
                <label class="form-check-label" for="isAvailable">
                  Available
                </label>
              </div>
              <div class="form-check form-check">
                <input
                  class="form-check-input"
                  type="radio"
                  value={false}
                  {...register("isAvailable", { required: true })}
                />
                <label class="form-check-label" for="isAvailable">
                  Not Available
                </label>
              </div>
            </div>
          </div>
          <div class="form-group row my-3 mt-4">
            <div class="col-sm-4"></div>
            <div class="col-sm-4">
              <button
                type="submit"
                class="btn btn-danger mr-4"
                disabled={!isDirty || !isValid}
              >
                Save
              </button>
              <Link
                to={{
                  pathname: "/assets",
                }}
              >
                <button class="btn btn-light">Cancel</button>
              </Link>
            </div>
          </div>
        </form>
        <Modal show={isError}>
          <Modal.Header style={{ backgroundColor: "#DDE1E5" }}>
            <Modal.Title
              style={{ fontSize: "20px", fontWeight: "bold", color: "#dc3545" }}
            >
              Are you sure?
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <p>{errorMessage}</p>
          </Modal.Body>

          <Modal.Footer>
            <Button
              style={{
                backgroundColor: "#dc3545",
                border: "1px solid #dc3545",
                borderRadius: "4px",
              }}
              onClick={() => {
                document.getElementById("categoryInput").value = "";
                setIsError(false);
                setCategoryName("");
              }}
            >
              Ok
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}
