import React, { useEffect, useState } from "react";
import { Update, GetDetail } from "../../../services/assetService";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import { MdOutlineCancelPresentation } from "react-icons/md";
export default function EditAsset(props) {
  const [errorMessage, setErrorMessage] = useState(false);
  let history = useHistory();
  const initAsset = {
    id: null,
    name: "",
    specification: "",
    installedDate: null,
    category: { name: "" },
    state: 0,
  };
  const formatDate = (date) => {
    var d = new Date(date),
      month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  };
  const [asset, setAsset] = useState(initAsset);
  const { id } = useParams();
  useEffect(() => {
    GetDetail(id)
      .then((response) => {
        response.state = response.state.toString();
        setAsset({ ...response });
        setValue("name", asset.name);
        setValue("specification", asset.specification);
        setValue("installedDate", formatDate(asset.installedDate));
        setValue("state", asset.state);
      })
      .catch((error) => console.log(error));
  }, [id, asset.name]);
  console.log(asset.state);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { isDirty, isValid },
  } = useForm({
    defaultValues: {
      name: asset.name,
      specification: asset.specification,
      installedDate: formatDate(asset.installedDate),
      state: 0,
    },
    mode: "onChange",
  });
  const onHandleSubmit = (data) => {
    const fd = new FormData();
    for (var key in data) {
      fd.append(key, data[key]);
    }
    Update(id, fd)
      .then((response) => {
        if (response.status) {
          console.log(response);
          history.push("/assets?IsSortByUpdatedDate=true");
        }
      })
      .catch((error) => {
        setErrorMessage(true);
      });
  };
  const [state, setState] = useState();
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
          Edit Asset
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
              <select class="form-control form-select" disabled>
                <option> {asset.category.name}</option>
              </select>
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
            <label htmlFor="state" class="col-sm-2 col-form-label">
              State
            </label>
            <div class="col-sm-4">
              <div class="form-check form-check">
                <input
                  class="form-check-input "
                  type="radio"
                  name="state"
                  value="0"
                  {...register("state", { required: true })}
                />
                <label class="form-check-label" for="state">
                  Available
                </label>
              </div>
              <div class="form-check form-check">
                <input
                  class="form-check-input"
                  type="radio"
                  name="state"
                  value="1"
                  {...register("state", { required: true })}
                />
                <label class="form-check-label" for="state">
                  Not Available
                </label>
              </div>
              <div class="form-check form-check">
                <input
                  class="form-check-input "
                  type="radio"
                  name="state"
                  value="3"
                  {...register("state", { required: true })}
                />
                <label class="form-check-label" for="state">
                  Wating for recycling
                </label>
              </div>
              <div class="form-check form-check">
                <input
                  class="form-check-input "
                  type="radio"
                  value="4"
                  name="state"
                  {...register("state", { required: true })}
                />
                <label class="form-check-label" for="state">
                  Recycled
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
      </div>
      <Modal show={errorMessage} centered>
        <Modal.Header style={{ backgroundColor: "#DDE1E5" }}>
          <Modal.Title
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#dc3545",
              marginLeft: "20px",
            }}
          >
            Cannot Edit Asset
          </Modal.Title>
          <MdOutlineCancelPresentation
            onClick={() => {
              setErrorMessage(false);
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
          <p>Asset information has no longer existed.</p>
          <p>Please return Manage Asset Page</p>
        </Modal.Body>
        <Modal.Footer
          style={{ justifyContent: "flex-end", marginLeft: "20px" }}
        >
          <Link
            to={{
              pathname: "/assets",
            }}
          >
            <Button
              style={{
                backgroundColor: "#dc3545",
                border: "1px solid #dc3545",
                borderRadius: "4px",
              }}
            >
              Back
            </Button>
          </Link>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
