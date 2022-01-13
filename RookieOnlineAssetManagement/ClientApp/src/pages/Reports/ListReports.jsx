import React from "react";
import { Table, Button } from "react-bootstrap";
import { useState, useEffect } from "react";
import { GetReport, ExportReports } from "../../services/reportService";
import { GoTriangleDown } from "react-icons/go";
import { Link } from "react-router-dom";
const ListReports = () => {
  const [reports, setReports] = useState([]);
  const [isAscending, setIsAscending] = useState(true);
  const [sortBy, setSortBy] = useState("category");

  const handleExport = () => {
    ExportReports(sortBy, isAscending)
      .then((response) => {
        window.open(response.request.responseURL);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    GetReport(sortBy, isAscending)
      .then((response) => {
        setReports([...response]);
      })
      .catch((error) => console.log(error));
  }, [sortBy, isAscending]);
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
          Report
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            paddingBottom: "20px",
            width: "95%",
          }}
        >
          <Button variant="danger" onClick={handleExport}>
            Export
          </Button>
        </div>

        <Table
          style={{
            height: "400px",
            overflowX: "auto",
            overflowY: "hidden",
            width: "95%",
          }}
        >
          <thead>
            <tr>
              <th style={{ width: "15%" }}>
                Category
                <GoTriangleDown
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setIsAscending(!isAscending);
                    setSortBy("category");
                  }}
                ></GoTriangleDown>
              </th>
              <th>
                Total
                <GoTriangleDown
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setIsAscending(!isAscending);
                    setSortBy("total");
                  }}
                ></GoTriangleDown>
              </th>
              <th>
                Assigned
                <GoTriangleDown
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setIsAscending(!isAscending);
                    setSortBy("assigned");
                  }}
                ></GoTriangleDown>
              </th>
              <th>
                Available
                <GoTriangleDown
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setIsAscending(!isAscending);
                    setSortBy("available");
                  }}
                ></GoTriangleDown>
              </th>
              <th style={{ width: "13.2%" }}>
                Not Available
                <GoTriangleDown
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setIsAscending(!isAscending);
                    setSortBy("notAvailable");
                  }}
                ></GoTriangleDown>
              </th>
              <th style={{ width: "20%" }}>
                Waiting For Recycling
                <GoTriangleDown
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setIsAscending(!isAscending);
                    setSortBy("waitingForRecycling");
                  }}
                ></GoTriangleDown>
              </th>
              <th>
                Recycled
                <GoTriangleDown
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setIsAscending(!isAscending);
                    setSortBy("recycled");
                  }}
                ></GoTriangleDown>
              </th>
              <th style={{ width: "2%" }}></th>
            </tr>
          </thead>
          <tbody>
            {reports &&
              reports.map((report) => (
                <tr>
                  <td style={{ width: "15.2%" }}>{report.category}</td>
                  <td style={{ width: "12.75%" }}>{report.total}</td>
                  <td style={{ width: "12.75%" }}>{report.assigned}</td>
                  <td style={{ width: "12.75%" }}>{report.available}</td>
                  <td style={{ width: "13.2%" }}>{report.notAvailable}</td>
                  <td style={{ width: "20.3%" }}>{report.waitingForRecycling}</td>
                  <td>{report.recycled}</td>
                  <td style={{ width: "2%" }}></td>
                </tr>
              ))}
          </tbody>
        </Table>
      </div>
    </React.Fragment>
  );
};

export default ListReports;
