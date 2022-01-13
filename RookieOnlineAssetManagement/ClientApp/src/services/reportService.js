import axios from "axios";

const API_URL = "/api/reports";

export async function ExportReports(sortBy, isAscending) {
  var query = sortBy !== null ? `${"?sortBy=" + sortBy}` : "?sortBy=category";
  query += isAscending !== true ? `${"&isAscending=" + isAscending}` : "";
  return await axios.get(API_URL + "/ExportReports" + query).then((response) => response);
}
export async function GetReport(sortBy, isAscending) {
  console.log("is", isAscending);
  var query = sortBy !== null ? `${"?sortBy=" + sortBy}` : "?sortBy=category";
  query += isAscending !== true ? `${"&isAscending=" + isAscending}` : "";
  return await axios.get(API_URL + query).then((response) => response.data);
}
