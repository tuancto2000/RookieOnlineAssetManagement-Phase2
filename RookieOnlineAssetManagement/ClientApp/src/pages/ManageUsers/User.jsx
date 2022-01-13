import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import * as moment from "moment";
import { useParams, useHistory, Link } from "react-router-dom";

import userService from "../../services/user.service";

function getAge(dateString) {
  var today = new Date();
  var birthDate = new Date(dateString);
  var age = today.getFullYear() - birthDate.getFullYear();
  var m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

const getSaturdayOrSunday = (value) => {
  console.log(value.getDay());

  if (value.getDay() === 6 || value.getDay() === 0) {
    return true;
  }
  return false;
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

function User(props) {
  let history = useHistory();

  // form validation rules
  const validationSchema = Yup.object().shape({
    doB: Yup.date()
      .required("DoB is required")
      .test(
        "DOB",
        "User is under 18. Please select a different date",
        (value) => {
          return getAge(value) >= 18;
        }
      ),
    joinedDate: Yup.date()
      .required("DoB is required")
      .min(
        Yup.ref("doB"),
        "Joined date is not later than Date of Birth. Please select a different date"
      )
      .test(
        "doB",
        "Joined date is Saturday or Sunday. Please select a different date",
        (value) => {
          return getSaturdayOrSunday(value) === false;
        }
      ),
    type: Yup.string().required("Type is required"),
  });

  const initialUserState = {
    id: null,
    firstName: "",
    lastName: "",
    doB: "",
    gender: true,
    joinedDate: "",
    type: null,
  };

  const [user, setUser] = useState({});
  const { id } = useParams();

  const getUser = (id) => {
    userService
      .getUser(id)
      .then((response) => {
        const fields = [
          "firstName",
          "lastName",
          "doB",
          "gender",
          "joinedDate",
          "type",
        ];
        fields.forEach((field) => {
          if (field === "doB" || field === "joinedDate") {
            const temp = formatDate(response.data[field]);
            console.log(temp);
            setValue(field, temp);
          } else if (field === "gender") {
            const tmp = response.data["gender"] ? "F" : "M";
            setValue(field, tmp);
          } else {
            setValue(field, response.data[field]);
          }
        });
        setUser(response.data);
        console.log(user);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  useEffect(() => {
    getUser(id);
  }, [id]);

  const formOptions = {
    resolver: yupResolver(validationSchema),
    mode: "onChange",
  };

  // get functions to build form with useForm() hook
  const { register, handleSubmit, setValue, formState, watch, getValue } =
    useForm(formOptions);
  const { errors, isDirty, isValid } = formState;
  const watchAllFields = watch();

  function onSubmit(data) {
    const user = new FormData();
    for (var key in data) {
      if (key === "doB" || key === "joinedDate") {
        var temp = formatDate(data[key]);
        user.append(key, temp);
      } else if (key === "gender") {
        const tmp = data[key] === "F" ? true : false;
        user.append(key, tmp);
      } else {
        user.append(key, data[key]);
      }
    }
    console.log(user);
    userService
      .update(id, user)
      .then((response) => {
        history.push("/users?IsSortByUpdatedDate=true");
        console.log("Update User");
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
        Edit User
      </h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div class="form-group row">
          <label htmlFor="firstName" class="col-sm-2 col-form-label">
            First Name
          </label>
          <div class="col-sm-4">
            <input
              disabled
              name="firstName"
              type="text"
              {...register("firstName")}
              className={`form-control ${errors.firstName ? "is-invalid" : ""}`}
            />
            <div className="invalid-feedback">{errors.firstName?.message}</div>
          </div>
        </div>
        <div class="form-group row mt-4">
          <label htmlFor="lastName" class="col-sm-2 col-form-label">
            Last Name
          </label>
          <div class="col-sm-4">
            <input
              disabled
              name="lastName"
              type="text"
              {...register("lastName")}
              className={`form-control ${errors.lastName ? "is-invalid" : ""}`}
            />
            <div className="invalid-feedback">{errors.lastName?.message}</div>
          </div>
        </div>
        <div class="form-group row mt-4">
          <label htmlFor="doB" class="col-sm-2 col-form-label">
            Date of Birth
          </label>
          <div class="col-sm-4">
            <input
              name="doB"
              type="date"
              {...register("doB")}
              className={`form-control ${errors.doB ? "is-invalid" : ""}`}
            />
            <div className="invalid-feedback">{errors.doB?.message}</div>
          </div>
        </div>
        <div class="form-group row mt-4">
          <label htmlFor="gender" class="col-sm-2 col-form-label">
            Gender
          </label>
          <div class="col-sm-4">
            <div class="form-check form-check-inline">
              <input
                name="gender"
                type="radio"
                {...register("gender")}
                id="gender1"
                value="F"
                className={`form-check-input ${
                  errors.gender ? "is-invalid" : ""
                }`}
              />
              <label class="form-check-label" for="gender">
                Female
              </label>
            </div>
            <div class="form-check form-check-inline">
              <input
                name="gender"
                type="radio"
                {...register("gender")}
                id="gender2"
                value="M"
                className={`form-check-input ${
                  errors.gender ? "is-invalid" : ""
                }`}
              />
              <label class="form-check-label" for="gender">
                Male
              </label>
            </div>
          </div>
        </div>
        <div class="form-group row mt-4">
          <label htmlFor="joinedDate" class="col-sm-2 col-form-label">
            Joined Date
          </label>
          <div class="col-sm-4">
            <input
              name="joinedDate"
              type="date"
              {...register("joinedDate")}
              className={`form-control ${
                errors.joinedDate ? "is-invalid" : ""
              }`}
            />
            <div className="invalid-feedback">{errors.joinedDate?.message}</div>
          </div>
        </div>
        <div class="form-group row mt-4">
          <label htmlFor="type" class="col-sm-2 col-form-label">
            Type
          </label>
          <div class="col-sm-4">
            <select
              name="type"
              {...register("type")}
              className={`form-control ${errors.type ? "is-invalid" : ""}`}
            >
              <option></option>
              <option value={1}>Staff</option>
              <option value={2}>Admin</option>
            </select>
            <div className="invalid-feedback">{errors.type?.message}</div>
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
                pathname: "/users",
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

export default User;
