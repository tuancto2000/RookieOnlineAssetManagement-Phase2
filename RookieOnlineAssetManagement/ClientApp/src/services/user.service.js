import axios from "axios";

const API_URL = "/api";

const create = (data) => {
  return axios.post(API_URL + "/users", data);
};

const update = (id, data) => {
  console.log(data);
  return axios.put(API_URL + `/users/${id}`, data);
};

const getUser = (id) => {
  return axios.get(API_URL + `/users/${id}`);
};

const getUserFilter = (page) => {
  return axios.get(API_URL + `/users/paging?pageIndex=${page}`);
};
const disabled = (id) => {
  console.log(id);
  return axios.patch(API_URL + `/users/${id}`);
};

const getUsersPagingDefault = (afterCreated, affterUpdated) => {
  var query = afterCreated ? `${"&IsSortByCreatedDate=" + afterCreated}` : "";
  query += affterUpdated ? `${"&IsSortByUpdatedDate=" + affterUpdated}` : "";
  return axios.get(API_URL + "/users/paging?pageSize=10" + query);
};

const getUsersPagingFilter = (filter) => {
  console.log(filter.IsSortByUpdatedDate);
  var query = filter.keyword ? `${"&keyword=" + filter.keyword}` : "";
  query += filter.typeFilter ? `${"&typeFilter=" + filter.typeFilter}` : "";
  query += filter.sortBy ? `${"&sortBy=" + filter.sortBy}` : "";
  query += filter.IsSortByCreatedDate
    ? `${"&IsSortByCreatedDate=" + filter.IsSortByCreatedDate}`
    : "";
  query += filter.IsSortByUpdatedDate
    ? `${"&IsSortByUpdatedDate=" + filter.IsSortByUpdatedDate}`
    : "";
  query += filter.pageIndex ? `${"&pageIndex=" + filter.pageIndex}` : "";
  query += filter.sortBy ? `${"&sortBy=" + filter.sortBy}` : "";
  query += filter.isAscending === false ? "&isAscending=false" : "";
  return axios.get(API_URL + "/users/paging?pageSize=10" + query);
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  getUser,
  create,
  update,
  getUserFilter,
  disabled,
  getUsersPagingDefault,
  getUsersPagingFilter,
};
