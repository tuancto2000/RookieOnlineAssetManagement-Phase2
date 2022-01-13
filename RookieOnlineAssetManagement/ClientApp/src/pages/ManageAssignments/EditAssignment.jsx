import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useParams, useHistory, Link } from "react-router-dom";

import { GetDetail, Update } from "../../services/assignmentService";

function EditAssignment() {
  const { id } = useParams();
  const history = useHistory();
  const now = formatDate(new Date());
  // form validation rules
  const validationSchema = Yup.object().shape({
    assignedToName: Yup.string().required("User is required"),
    assetName: Yup.string().required("Asset is required"),
    assignedDate: Yup.date()
      .required("Assigned Date is required")
      .min(
        now,
        "Admin can select only current or future date for Assigned Date"
      ),
  });
  const formOptions = { resolver: yupResolver(validationSchema) };

  // get functions to build form with useForm() hook
  const { register, handleSubmit, formState, setValue } = useForm(formOptions);
  const { errors } = formState;

  const getAssignment = (id) => {
    console.log();
    GetDetail(id)
      .then((response) => {
        console.log(response);
        const fields = ["assignedToName", "assetName", "assignedDate", "note"];
        fields.forEach((field) => {
          if (field === "assignedDate") {
            const temp = formatDate(response[field]);
            setValue(field, temp);
          } else {
            setValue(field, response[field]);
          }
        });
      })
      .catch((e) => {
        console.log(e);
      });
  };

  useEffect(() => {
    getAssignment(id);
  }, [id]);

  function onSubmit(data) {
    // display form data on success
    // alert("SUCCESS!! :-)\n\n" + JSON.stringify(data, null, 4));
    // return false;
    const assignment = new FormData();
    for (var key in data) {
      if (key === "assignedDate") {
        var temp = formatDate(data[key]);
        assignment.append(key, temp);
      } else {
        assignment.append(key, data[key]);
      }
    }

    Update(id, assignment)
      .then((response) => {
        history.push("/assignments?IsSortByUpdatedDate=true");
        console.log("Update Assignment");
      })
      .catch((e) => {
        console.log(e);
      });
  }

  return (
    <div className="container">
      <h1
        style={{
          color: "#dc3545",
          fontSize: "25px",
          fontWeight: "bold",
          marginTop: "25px",
          marginBottom: "25px",
        }}
      >
        Edit Assignment
      </h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div class="form-group row">
          <label htmlFor="assignedToName" class="col-sm-2 col-form-label">
            User
          </label>
          <div class="col-sm-4">
            <input
              disabled
              name="assignedToName"
              type="text"
              {...register("assignedToName")}
              className={`form-control ${
                errors.assignedToName ? "is-invalid" : ""
              }`}
            />
            <div className="invalid-feedback">
              {errors.assignedToName?.message}
            </div>
          </div>
        </div>
        <div class="form-group row mt-4">
          <label htmlFor="assetName" class="col-sm-2 col-form-label">
            Asset
          </label>
          <div class="col-sm-4">
            <input
              disabled
              name="assetName"
              type="text"
              {...register("assetName")}
              className={`form-control ${errors.assetName ? "is-invalid" : ""}`}
            />
            <div className="invalid-feedback">{errors.assetName?.message}</div>
          </div>
        </div>
        <div class="form-group row mt-4">
          <label htmlFor="assignedDate" class="col-sm-2 col-form-label">
            Assigned Date
          </label>
          <div class="col-sm-4">
            <input
              name="assignedDate"
              type="date"
              {...register("assignedDate")}
              className={`form-control ${
                errors.assignedDate ? "is-invalid" : ""
              }`}
            />
            <div className="invalid-feedback">
              {errors.assignedDate?.message}
            </div>
          </div>
        </div>
        <div class="form-group row mt-4">
          <label htmlFor="note" class="col-sm-2 col-form-label">
            Note
          </label>
          <div class="col-sm-4">
            <textarea
              name="note"
              type="text"
              row="4"
              {...register("note")}
              className={`form-control ${errors.note ? "is-invalid" : ""}`}
            />
            <div className="invalid-feedback">{errors.note?.message}</div>
          </div>
        </div>
        <div class="form-group row mt-4">
          <div class="col-sm-4"></div>
          <div class="col-sm-4">
            <button type="submit" class="btn btn-danger mr-4">
              Save
            </button>
            <Link
              to={{
                pathname: "/assignments",
              }}
            >
              <button class="btn btn-light">Cancel</button>
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}

const formatDate = (date) => {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};

export default EditAssignment;
