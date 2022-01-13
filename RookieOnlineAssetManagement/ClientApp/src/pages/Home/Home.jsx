import React, { useState, useEffect } from "react";
import { Table, Modal, Row, Form, Button } from "react-bootstrap";
import { IoClose } from "react-icons/io5";
import { BsCheckLg } from "react-icons/bs";
import { GoTriangleDown } from "react-icons/go";
import { IoReloadOutline } from "react-icons/io5";
import { MdOutlineCancelPresentation } from "react-icons/md";
import {
  GetOwnAssignments,
  GetDetail,
  RespondAssignment,
} from "../../services/assignmentService";
import { Create } from "../../services/returnRequestService";

const Home = () => {
  const [ownAssignments, setOwnAssignments] = useState([]);
  const [idRespondAssignment, setIdRespondAssignment] = useState(0);
  const [isFetch, setIsFetch] = useState(false);
  const [isAccept, setIsAccept] = useState(false);
  const [isDecline, setIsDecline] = useState(false);
  const [isReturn, setIsReturn] = useState(false);
  const [detailId, setDetailId] = useState();
  const [isShowDetail, setIsShowDetail] = useState(false);
  const [isAscending, setIsAscending] = useState(false);
  const [sortBy, setSortBy] = useState("assetCode");
  const [isFilter, setIsFilter] = useState(false);
  const [searchFilterModel, setSearchFilterModel] = useState({});
  const [detailedAssignment, setDetailedAssignment] = useState({
    id: detailId,
    code: "",
    name: "",
    specification: "",
    AssignedTo: "",
    AssignedBy: "",
    AssignedDate: null,
    state: "",
    note: "",
  });

  const StateToString = (state) => {
    switch (state) {
      case 0:
        return "Waiting For Acceptance";
        break;
      case 1:
        return "Accepted";
        break;
      case 2:
        return "Declined";
        break;
      case 3:
        return "Waiting For Returning";
        break;
      case 4:
        return "Returned";
        break;
      default:
        return "Unknown";
        break;
    }
  };

  const formatDate = (date) => {
    if (date !== null && date !== undefined) {
      var d = new Date(date),
        month = "" + (d.getMonth() + 1),
        day = "" + d.getDate(),
        year = d.getFullYear();

      if (month.length < 2) month = "0" + month;
      if (day.length < 2) day = "0" + day;

      return [month, day, year].join("-");
    } else {
      return null;
    }
  };

  const handleAccept = () => {
    if (idRespondAssignment !== 0)
      RespondAssignment(idRespondAssignment, true).then((respone) => {
        setIsAccept(false);
        setIsFetch(true);
        setIdRespondAssignment(0);
      });
  };

  const handleDecline = () => {
    if (idRespondAssignment !== 0)
      RespondAssignment(idRespondAssignment, false).then((respone) => {
        setIsDecline(false);
        setIsFetch(true);
        setIdRespondAssignment(0);
      });
  };

  const handleCreateReturningRequest = () => {
    if (idRespondAssignment !== 0) {
      const returnRequest = new FormData();
      returnRequest.append("assignmentId", idRespondAssignment);
      Create(returnRequest)
        .then((response) => {
          setIsReturn(false);
          setIsFetch(true);
          setIdRespondAssignment(0);
        })
        .catch((e) => {
          console.log(e);
        });
    }
  };

  useEffect(() => {
    setSearchFilterModel({
      ...searchFilterModel,
      sortBy: sortBy,
      isAscending: isAscending,
    });
    setIsFilter(true);
  }, [sortBy, isAscending, isFetch]);

  useEffect(() => {
    GetOwnAssignments(searchFilterModel).then((response) => {
      setOwnAssignments(response);
      setIsFilter(false);
      setIsFetch(false);
    });
  }, [isFilter]);

  useEffect(() => {
    if (isShowDetail == true) {
      GetDetail(detailId).then((res) => {
        setDetailedAssignment({
          ...detailedAssignment,
          code: res.assetCode,
          name: res.assetName,
          specification: res.specification,
          AssignedTo: res.assignedToName,
          AssignedBy: res.assignedByName,
          AssignedDate: formatDate(res.assignedDate),
          state: StateToString(res.state),
          note: res.note,
        });
        setDetailId(0);
      });
    }
  }, [isShowDetail]);

  return (
    <div style={{ padding: "100px 50px" }}>
      <div
        style={{
          color: "#dc3545",
          fontSize: "25px",
          fontWeight: "bold",
          marginBottom: "25px",
        }}
      >
        My Assignment
      </div>
      <Table style={{ width: "1000px", height: "500px" }}>
        <thead>
          <tr>
            <th>
              Asset Code
              <GoTriangleDown
                style={{ marginLeft: "5px", cursor: "pointer" }}
                onClick={() => {
                  setIsAscending(!isAscending);
                  setSortBy("assetCode");
                }}
              />
            </th>
            <th>
              Asset Name
              <GoTriangleDown
                style={{ marginLeft: "5px", cursor: "pointer" }}
                onClick={() => {
                  setIsAscending(!isAscending);
                  setSortBy("assetName");
                }}
              />
            </th>
            <th>
              State
              <GoTriangleDown
                style={{ marginLeft: "5px", cursor: "pointer" }}
                onClick={() => {
                  setIsAscending(!isAscending);
                  setSortBy("state");
                }}
              />
            </th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {ownAssignments &&
            ownAssignments.map((assignment) =>
              StateToString(assignment.state) === "Declined" ? (
                ""
              ) : (
                <tr>
                  <td
                    onClick={() => {
                      setIsShowDetail(true);
                      setDetailId(assignment.id);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    {assignment.assetCode}
                  </td>
                  <td
                    onClick={() => {
                      setIsShowDetail(true);
                      setDetailId(assignment.id);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    {assignment.assetName}
                  </td>
                  <td
                    onClick={() => {
                      setIsShowDetail(true);
                      setDetailId(assignment.id);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    {StateToString(assignment.state)}
                  </td>
                  <td>
                    <BsCheckLg
                      onClick={() => {
                        if (StateToString(assignment.state) === "Waiting For Acceptance") {
                          setIdRespondAssignment(assignment.id);
                          setIsAccept(true);
                        }
                      }}
                      style={{
                        fontSize: "18px",
                        color: `${StateToString(assignment.state) === "Waiting For Acceptance" ? "#dc3545" : "#808080"}`,
                        cursor: `${StateToString(assignment.state) === "Waiting For Acceptance" ? "pointer" : "default"}`,
                      }}
                    />
                    <IoClose
                      onClick={() => {
                        if (StateToString(assignment.state) === "Waiting For Acceptance") {
                          setIdRespondAssignment(assignment.id);
                          setIsDecline(true);
                        }
                      }}
                      style={{
                        fontSize: "25px",
                        marginLeft: "5px",
                        color: `${StateToString(assignment.state) === "Waiting For Acceptance" ? "#000" : "#f2a7ac"}`,
                        fontSize: "25px",
                        cursor: `${StateToString(assignment.state) === "Waiting For Acceptance" ? "pointer" : "default"}`,
                      }}
                    />
                    <IoReloadOutline
                      onClick={() => {
                        if (StateToString(assignment.state) === "Accepted") {
                          setIdRespondAssignment(assignment.id);
                          setIsReturn(true);
                        }
                      }}
                      style={{
                        fontWeight: "bold",
                        color: `${StateToString(assignment.state) === "Accepted" ? "#095ee6" : "#999999"}`,
                        marginLeft: "5px",
                        fontSize: "20px",
                        cursor: `${StateToString(assignment.state) === "Accepted" ? "pointer" : "default"}`,
                      }}
                    />
                  </td>
                </tr>
              )
            )}
        </tbody>
      </Table>

      <Modal dialogClassName="modal-90w" centered show={isShowDetail}>
        <Modal.Header style={{ backgroundColor: "#DDE1E5" }}>
          <Modal.Title
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#dc3545",
              marginLeft: "20px",
            }}
          >
            Detailed Assignment Information
          </Modal.Title>
          <MdOutlineCancelPresentation
            onClick={() => {
              setIsShowDetail(false);
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
            <Form.Label column="sm" lg={4}>
              Asset Code
            </Form.Label>

            <Form.Label column="sm" lg={8}>
              {detailedAssignment.code}
            </Form.Label>
          </Row>
          <br />
          <Row style={{ display: "inline" }}>
            <Form.Label column="sm" lg={4}>
              Asset name
            </Form.Label>

            <Form.Label column="sm" lg={8}>
              {detailedAssignment.name}
            </Form.Label>
          </Row>
          <br />
          <Row style={{ display: "inline" }}>
            <Form.Label column="sm" lg={4}>
              Specification
            </Form.Label>

            <Form.Label column="sm" lg={8}>
              {detailedAssignment.specification}
            </Form.Label>
          </Row>
          <br />
          <Row style={{ display: "inline" }}>
            <Form.Label column="sm" lg={4}>
              Assigned By
            </Form.Label>

            <Form.Label column="sm" lg={8}>
              {detailedAssignment.AssignedBy}
            </Form.Label>
          </Row>
          <br />
          <Row style={{ display: "inline" }}>
            <Form.Label column="sm" lg={4}>
              Assigned To
            </Form.Label>

            <Form.Label column="sm" lg={8}>
              {detailedAssignment.AssignedTo}
            </Form.Label>
          </Row>
          <br />
          <Row style={{ display: "inline" }}>
            <Form.Label column="sm" lg={4}>
              Assigned Date
            </Form.Label>

            <Form.Label column="sm" lg={8}>
              {detailedAssignment.AssignedDate}
            </Form.Label>
          </Row>
          <br />
          <Row style={{ display: "inline" }}>
            <Form.Label column="sm" lg={4}>
              State
            </Form.Label>
            <Form.Label column="sm" lg={8}>
              {detailedAssignment.state}
            </Form.Label>
          </Row>
          <br />
          <Row style={{ display: "inline" }}>
            <Form.Label column="sm" lg={4}>
              Note
            </Form.Label>
            <Form.Label column="sm" lg={8}>
              {detailedAssignment.note}
            </Form.Label>
          </Row>
          <br />
        </Modal.Body>
      </Modal>

      <Modal show={isAccept} centered>
        <Modal.Header style={{ backgroundColor: "#DDE1E5" }}>
          <Modal.Title
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#dc3545",
              marginLeft: "20px",
            }}
          >
            Are you sure?
          </Modal.Title>
        </Modal.Header>

        <Modal.Body
          style={{
            marginLeft: "20px",
          }}
        >
          <p>Do you want to accept this assignment?</p>
        </Modal.Body>

        <Modal.Footer style={{ justifyContent: "flex-start", marginLeft: "20px" }}>
          <Button
            style={{
              backgroundColor: "#dc3545",
              border: "1px solid #dc3545",
              borderRadius: "4px",
            }}
            onClick={handleAccept}
          >
            Accept
          </Button>
          <Button
            style={{
              backgroundColor: "#FFF",
              border: "1px solid rgb(89 86 86)",
              borderRadius: "4px",
              color: "black",
              marginLeft: "20px",
            }}
            onClick={() => {
              setIsAccept(false);
              setIdRespondAssignment(0);
            }}
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={isDecline} centered>
        <Modal.Header style={{ backgroundColor: "#DDE1E5" }}>
          <Modal.Title
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#dc3545",
              marginLeft: "20px",
            }}
          >
            Are you sure?
          </Modal.Title>
        </Modal.Header>

        <Modal.Body
          style={{
            marginLeft: "20px",
          }}
        >
          <p>Do you want to decline this assignment?</p>
        </Modal.Body>

        <Modal.Footer style={{ justifyContent: "flex-start", marginLeft: "20px" }}>
          <Button
            style={{
              backgroundColor: "#dc3545",
              border: "1px solid #dc3545",
              borderRadius: "4px",
            }}
            onClick={handleDecline}
          >
            Decline
          </Button>
          <Button
            style={{
              backgroundColor: "#FFF",
              border: "1px solid rgb(89 86 86)",
              borderRadius: "4px",
              color: "black",
              marginLeft: "20px",
            }}
            onClick={() => {
              setIsDecline(false);
              setIdRespondAssignment(0);
            }}
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={isReturn} centered>
        <Modal.Header style={{ backgroundColor: "#DDE1E5" }}>
          <Modal.Title
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#dc3545",
              marginLeft: "20px",
            }}
          >
            Are you sure?
          </Modal.Title>
        </Modal.Header>

        <Modal.Body
          style={{
            marginLeft: "20px",
          }}
        >
          <p>Do you want to create a returning request for this asset?</p>
        </Modal.Body>

        <Modal.Footer style={{ justifyContent: "flex-start", marginLeft: "20px" }}>
          <Button
            style={{
              backgroundColor: "#dc3545",
              border: "1px solid #dc3545",
              borderRadius: "4px",
            }}
            onClick={handleCreateReturningRequest}
          >
            Yes
          </Button>
          <Button
            style={{
              backgroundColor: "#FFF",
              border: "1px solid rgb(89 86 86)",
              borderRadius: "4px",
              color: "black",
              marginLeft: "10px",
            }}
            onClick={() => {
              setIsReturn(false);
              setIdRespondAssignment(0);
            }}
          >
            No
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Home;
