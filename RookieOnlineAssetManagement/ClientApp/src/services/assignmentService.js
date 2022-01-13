import axios from "axios";

const API_URL = "/api/assignments/";

export async function GetOwnAssignments(filter) {
    var query = filter.isAscending === false ? `${"isAscending=false"}` : "";
    query += filter.sortBy ? `${"&sortBy=" + filter.sortBy}` : "";
    return await axios.get(API_URL + "GetOwnAssignments?" + query).then((response) => response.data);
}
export async function RespondAssignment(assignmentId, isAccepted) {
    return await axios.put(API_URL + "RespondAssignment/" + `${assignmentId}` + `/${isAccepted}`);
}
export async function GetDetail(id) {
    return await axios.get(API_URL + `${id}`).then((response) => response.data);
}
export async function GetAssignmentState() {
    return await axios.get(API_URL + "states").then((response) => response.data);
}
export async function Delete(id) {
    return await axios.delete(API_URL + `${id}`);
}
export async function Create(data) {
    return await axios.post(API_URL, data);
};
export async function Update(id, data) {
    return await axios.put(API_URL + `${id}`, data);
};
export async function GetAssignmentsPagingDefault(afterCreated, afterUpdated) {
    var query = afterCreated ? `${"&IsSortByCreatedDate=" + afterCreated}` : "";
    query += afterUpdated ? `${"&IsSortByUpdatedDate=" + afterUpdated}` : "";
    return await axios
        .get(API_URL + "paging?pageSize=10" + query)
        .then((response) => response.data);
}
export async function GetAssignmentsPagingFilter(filter) {
    var query = filter.IsSortByCreatedDate ? `${"&IsSortByCreatedDate=" + filter.IsSortByCreatedDate}` : "";
    query += filter.IsSortByUpdatedDate === "true" ? `${"&IsSortByUpdatedDate=" + filter.IsSortByUpdatedDate}` : "";
    query += filter.pageIndex ? `${"&pageIndex=" + filter.pageIndex}` : "";
    query += filter.isAscending === false ? `${"&isAscending=false"}` : "";
    query += filter.keyword ? `${"&keyword=" + filter.keyword}` : "";
    query += filter.statesFilter
        ? `${"&statesFilter=" + filter.statesFilter}`
        : "";
    query += (filter.assignedDateFilter !== undefined && filter.assignedDateFilter !== null)
        ? `${"&assignedDateFilter=" + filter.assignedDateFilter}`
        : "";
    query += filter.sortBy ? `${"&sortBy=" + filter.sortBy}` : "";
    return await axios
        .get(API_URL + "paging?pageSize=10" + query)
        .then((response) => response.data);
}