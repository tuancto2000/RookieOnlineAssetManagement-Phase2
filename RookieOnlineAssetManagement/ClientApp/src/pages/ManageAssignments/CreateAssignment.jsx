import React, { useState, useEffect } from "react";
import SelectUsers from "./SelectUsers";
import { InputGroup, FormControl, Button, Form } from "react-bootstrap";
import { BsSearch } from "react-icons/bs";
import { FaCalendarAlt } from "react-icons/fa";
import SelectAssets from "./SelectAssets";
import { useParams, useHistory, Link } from "react-router-dom";

import { Create } from "../../services/assignmentService";




function CreateAssignment(props) {
  let history = useHistory();
  const [isOpenSelectUsers, setIsOpenSelectUsers] = useState(false);
  const [isOpenSelectAssets, setIsOpenSelectAssets] = useState(false);
  const [assetLabel, setAssetLabel] = useState("");
  const [assetValue, setAssetValue] = useState(0);
  const [userLabel, setUserLabel] = useState("");
  const [userValue, setUserValue] = useState(0);
  const [assignedDate, setAssignedDate] = useState(formatDate(new Date()));
  const [note, setNote] = useState("");
  const [btnDisabled, setBtnDisabled] = useState(true);
  const [message, setMessage] = useState("");

  


  useEffect(() => {
    if(userValue.length > 0 && assetValue.length > 0 && (assignedDate >= formatDate(new Date()))){
      setBtnDisabled(false);
    }
  }, [userValue, assetValue, assignedDate]);

  const submitForm = () => {
    const assignment = new FormData();
    
    assignment.append("assignedTo", userValue);
    assignment.append("assetId", assetValue);
    assignment.append("assignedDate", assignedDate);
    assignment.append("note", note);
    Create(assignment)
      .then((response) => {
        history.push("/assignments?IsSortByCreatedDate=true");
        console.log("Create Assignment");
      })
      .catch((e) => {
        console.log(e);
      });

  }

  const handleAssignedDate = (e) => {
    const now = formatDate(new Date())
    console.log(e.target.value);
    console.log(now);
    if(e.target.value < now){
      setBtnDisabled(true);
      setMessage("Admin can select only current or future date for Assigned Date");
    } else{
      setMessage("");
    }
    setAssignedDate(e.target.value);
  }


  return (
    <div style={{ padding: "50px", width: "600px" }}>
      <div
        style={{
          color: "#dc3545",
          fontSize: "25px",
          fontWeight: "bold",
          marginBottom: "25px",
        }}
      >
        Create New Assignment
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "450px",
        }}
      >
        <div style={{ marginRight: "115px" }}>User</div>
        <InputGroup style={{ width: "300px" }}>
          <FormControl
            type="search"
            placeholder=""
            value={userLabel}
            onClick={() => setIsOpenSelectUsers(true)}
            style={{ borderRight: "0px", backgroundColor: "#FFF" }}
            readOnly
          />
          <InputGroup.Text style={{ backgroundColor: "#FFF" }}>
            <BsSearch style={{ color: "#000", marginBottom: "3px" }} />
          </InputGroup.Text>
        </InputGroup>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "450px",
          marginTop: "20px",
        }}
      >
        <div style={{ marginRight: "110px" }}>Asset</div>
        <InputGroup style={{ width: "300px" }}>
          <FormControl
            type="search"
            placeholder=""
            value={assetLabel}
            onClick={() => setIsOpenSelectAssets(true)}
            style={{ borderRight: "0px", backgroundColor: "#FFF" }}
            readOnly
          />
          <InputGroup.Text style={{ backgroundColor: "#FFF" }}>
            <BsSearch style={{ color: "#000", marginBottom: "3px" }} />
          </InputGroup.Text>
        </InputGroup>
      </div>

      <div
        style={{
          display: "flex",
          //alignItems: "center",
          justifyContent: "space-between",
          width: "450px",
          marginTop: "20px",
        }}
      >
        <div style={{ marginRight: "45px" }}>Assigned Date</div>
        <InputGroup
          style={{
            width: "300px",
            
          }}
        >
          <FormControl
            
            type="date"
            min={formatDate(new Date())}
            defaultValue={formatDate(new Date())}
            placeholder=""
            //onChange={(e) => {setAssignedDate(e.target.value)}}
            onChange={(e) => {handleAssignedDate(e)}}
            style={{ borderRight: "0px", backgroundColor: "#FFF", borderRight: "1px solid #ced4da",
            borderRadius: ".25rem" }}
          />
          <div style={{ color: "red", marginTop: "5px"}}>{message}</div>
        </InputGroup>
      </div>
      

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "450px",
          marginTop: "20px",
        }}
      >
        <div style={{ marginRight: "45px" }}>Note</div>
        <textarea onChange={(e)=> {setNote(e.target.value)}}
          style={{ width: "300px", height: "80px", borderColor: "#ced4da" }}
        ></textarea>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "end",
          marginTop: "30px",
          marginRight: "50px",
        }}
      >
        <Button
          style={{
            backgroundColor: "#dc3545",
            border: "1px solid #dc3545",
            borderRadius: "4px",
            marginRight: "20px",
          }}
          disabled={btnDisabled}
          onClick={submitForm}
        >
          Save
        </Button>
        <Link
            to={{
              pathname: "/assignments",
            }}
          >
            <Button
              style={{
                backgroundColor: "#FFF",
                border: "1px solid #808080",
                borderRadius: "4px",
                color: "#808080",
              }}
            >
              Cancel
            </Button>
        </Link>
        
      </div>

      {isOpenSelectUsers ? (
        <SelectUsers
          isOpenSelectUsers={isOpenSelectUsers}
          setIsOpenSelectUsers={setIsOpenSelectUsers}
          value={userValue}
          setValue={setUserValue}
          label={userLabel}
          setLabel={setUserLabel}
        />
      ) : (
        ""
      )}
      {isOpenSelectAssets ? (
        <SelectAssets
          isOpenSelectUsers={isOpenSelectAssets}
          setIsOpenSelectAssets={setIsOpenSelectAssets}
          value={assetValue}
          setValue={setAssetValue}
          label={assetLabel}
          setLabel={setAssetLabel}
        />
      ) : (
        ""
      )}
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

export default CreateAssignment;
