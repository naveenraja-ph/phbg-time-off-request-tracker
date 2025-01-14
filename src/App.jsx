import React, { useState, useEffect } from 'react';
    import { v4 as uuidv4 } from 'uuid';

    const App = () => {
      const [requests, setRequests] = useState(() => {
        const storedRequests = localStorage.getItem('timeOffRequests');
        return storedRequests ? JSON.parse(storedRequests) : [];
      });
      const [approvals, setApprovals] = useState(() => {
        const storedApprovals = localStorage.getItem('timeOffApprovals');
        return storedApprovals ? JSON.parse(storedApprovals) : [];
      });
      const [teamMembers, setTeamMembers] = useState(() => {
        const storedTeamMembers = localStorage.getItem('teamMembers');
        return storedTeamMembers ? JSON.parse(storedTeamMembers) : ['Madhu', 'Shalini', 'Manikanth', 'Adeline', 'Rashmi', 'Sachin', 'Rohit', 'Karthick'];
      });
      const [newMemberName, setNewMemberName] = useState('');
      const [selectedMember, setSelectedMember] = useState(teamMembers[0]);
      const [reason, setReason] = useState('');
      const [startTime, setStartTime] = useState('09:00');
      const [endTime, setEndTime] = useState('17:00');
      const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
      const [approvalReason, setApprovalReason] = useState('');
      const [selectedRequestForApproval, setSelectedRequestForApproval] = useState(null);
      const [category, setCategory] = useState("Doctor's Appointment");
      const categories = ["Doctor's Appointment", "Electrical issues", "Internet Issues", "Personal Work", "Late Login", "Early Logout", "Extended Lunch break", "Other"];
      const [editMode, setEditMode] = useState(null);
      const [editedRequest, setEditedRequest] = useState({
        member: '',
        date: '',
        startTime: '',
        endTime: '',
        category: '',
        reason: '',
      });
      const [editMemberMode, setEditMemberMode] = useState(null);
      const [editedMemberName, setEditedMemberName] = useState('');
      const [showPendingRequests, setShowPendingRequests] = useState(true);
      const [showApprovedRequests, setShowApprovedRequests] = useState(true);
      const [showTeamManagement, setShowTeamManagement] = useState(true);
      const [showInsights, setShowInsights] = useState(false);

      useEffect(() => {
        localStorage.setItem('timeOffRequests', JSON.stringify(requests));
      }, [requests]);

      useEffect(() => {
        localStorage.setItem('timeOffApprovals', JSON.stringify(approvals));
      }, [approvals]);

      useEffect(() => {
        localStorage.setItem('teamMembers', JSON.stringify(teamMembers));
      }, [teamMembers]);

      const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      };

      const formatTime = (timeString) => {
        const [hours, minutes] = timeString.split(':');
        let period = 'AM';
        let formattedHours = parseInt(hours, 10);
        if (formattedHours >= 12) {
          period = 'PM';
          if (formattedHours > 12) {
            formattedHours -= 12;
          }
        }
        if (formattedHours === 0) {
          formattedHours = 12;
        }
        return `${formattedHours}:${minutes} ${period}`;
      };

      const getDayOfWeek = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      };

      const handleRequestSubmit = (e) => {
        e.preventDefault();
        const newRequest = {
          id: uuidv4(),
          member: selectedMember,
          reason: reason,
          startTime: formatTime(startTime),
          endTime: formatTime(endTime),
          date: formatDate(selectedDate),
          day: getDayOfWeek(selectedDate),
          status: 'pending',
          category: category,
        };
        setRequests([...requests, newRequest]);
        setReason('');
        setStartTime('09:00');
        setEndTime('17:00');
        setSelectedDate(new Date().toISOString().slice(0, 10));
        setCategory("Doctor's Appointment");
      };

      const handleApprove = (requestId) => {
        const requestToApprove = requests.find((req) => req.id === requestId);
        if (requestToApprove) {
          const updatedRequests = requests.map((req) =>
            req.id === requestId ? { ...req, status: 'approved' } : req
          );
          setRequests(updatedRequests);
          const newApproval = {
            id: uuidv4(),
            requestId: requestId,
            member: requestToApprove.member,
            reason: requestToApprove.reason,
            startTime: requestToApprove.startTime,
            endTime: requestToApprove.endTime,
            date: requestToApprove.date,
            day: requestToApprove.day,
            approvalReason: approvalReason,
            status: 'approved',
            category: requestToApprove.category,
          };
          setApprovals([...approvals, newApproval]);
          setApprovalReason('');
          setSelectedRequestForApproval(null);
        }
      };

      const handleReject = (requestId) => {
        const requestToReject = requests.find((req) => req.id === requestId);
        if (requestToReject) {
          const updatedRequests = requests.map((req) =>
            req.id === requestId ? { ...req, status: 'rejected' } : req
          );
          setRequests(updatedRequests);
          const newApproval = {
            id: uuidv4(),
            requestId: requestId,
            member: requestToReject.member,
            reason: requestToReject.reason,
            startTime: requestToReject.startTime,
            endTime: requestToReject.endTime,
            date: requestToReject.date,
            day: requestToReject.day,
            approvalReason: approvalReason,
            status: 'rejected',
            category: requestToReject.category,
          };
          setApprovals([...approvals, newApproval]);
          setApprovalReason('');
          setSelectedRequestForApproval(null);
        }
      };

      const handleCancelRequest = (requestId) => {
        const updatedRequests = requests.map(req =>
          req.id === requestId ? { ...req, status: 'cancelled' } : req
        );
        setRequests(updatedRequests);
        const updatedApprovals = approvals.filter(app => app.requestId !== requestId);
        setApprovals(updatedApprovals);
      };

      const handleCancelApproval = (approvalId) => {
        const approvalToCancel = approvals.find((app) => app.id === approvalId);
        if (approvalToCancel) {
          const updatedApprovals = approvals.filter((app) => app.id !== approvalId);
          setApprovals(updatedApprovals);
          const updatedRequests = requests.map((req) =>
            req.id === approvalToCancel.requestId ? { ...req, status: 'pending' } : req
          );
          setRequests(updatedRequests);
        }
      };

      const handleAddMember = () => {
        if (newMemberName.trim() !== '') {
          setTeamMembers([...teamMembers, newMemberName.trim()]);
          setNewMemberName('');
        }
      };

      const handleRemoveMember = (memberToRemove) => {
        setTeamMembers(teamMembers.filter(member => member !== memberToRemove));
        setRequests(requests.filter(req => req.member !== memberToRemove));
        setApprovals(approvals.filter(app => app.member !== memberToRemove));
      };

      const handleEditRequest = (req) => {
        setEditMode(req.id);
        setEditedRequest({
          member: req.member,
          date: req.date,
          startTime: req.startTime,
          endTime: req.endTime,
          category: req.category,
          reason: req.reason,
        });
      };

      const handleSaveEdit = (requestId) => {
        const updatedRequests = requests.map((req) =>
          req.id === requestId ? {
            ...req,
            member: editedRequest.member,
            date: editedRequest.date,
            startTime: editedRequest.startTime,
            endTime: editedRequest.endTime,
            category: editedRequest.category,
            reason: editedRequest.reason,
          } : req
        );
        setRequests(updatedRequests);
        setEditMode(null);
      };

      const handleCancelEdit = () => {
        setEditMode(null);
      };

      const handleOnHold = (requestId) => {
        const updatedRequests = requests.map(req =>
          req.id === requestId ? { ...req, status: 'on-hold' } : req
        );
        setRequests(updatedRequests);
      };

      const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedRequest(prev => ({
          ...prev,
          [name]: value,
        }));
      };

      const handleEditMember = (member) => {
        setEditMemberMode(member);
        setEditedMemberName(member);
      };

      const handleSaveMemberEdit = () => {
        const updatedMembers = teamMembers.map(member =>
          member === editMemberMode ? editedMemberName : member
        );
        setTeamMembers(updatedMembers);
        setEditMemberMode(null);
        setEditedMemberName('');
      };

      const handleCancelMemberEdit = () => {
        setEditMemberMode(null);
        setEditedMemberName('');
      };

      const handleToggleSection = (section) => {
        switch (section) {
          case 'pending':
            setShowPendingRequests(!showPendingRequests);
            break;
          case 'approved':
            setShowApprovedRequests(!showApprovedRequests);
            break;
          case 'team':
            setShowTeamManagement(!showTeamManagement);
            break;
          case 'insights':
            setShowInsights(!showInsights);
            break;
          default:
            break;
        }
      };

      const generateInsights = () => {
        const memberRequestCounts = requests.reduce((acc, req) => {
          acc[req.member] = (acc[req.member] || 0) + 1;
          return acc;
        }, {});

        const categoryCounts = requests.reduce((acc, req) => {
          acc[req.category] = (acc[req.category] || 0) + 1;
          return acc;
        }, {});

        const statusCounts = requests.reduce((acc, req) => {
          acc[req.status] = (acc[req.status] || 0) + 1;
          return acc;
        }, {});

        const memberTimeOffPatterns = {};
        requests.forEach(req => {
          if (!memberTimeOffPatterns[req.member]) {
            memberTimeOffPatterns[req.member] = [];
          }
          memberTimeOffPatterns[req.member].push(req.day);
        });

        let report = "Time Off Request Insights:\n\n";
        report += "Requests per Member:\n";
        for (const member in memberRequestCounts) {
          report += `- ${member}: ${memberRequestCounts[member]} requests\n`;
        }

        report += "\nRequests per Category:\n";
        for (const category in categoryCounts) {
          report += `- ${category}: ${categoryCounts[category]} requests\n`;
        }

        report += "\nRequests per Status:\n";
        for (const status in statusCounts) {
          report += `- ${status}: ${statusCounts[status]} requests\n`;
        }

        report += "\nTime Off Patterns:\n";
        for (const member in memberTimeOffPatterns) {
          const days = memberTimeOffPatterns[member].join(', ');
          report += `- ${member}: Time off on ${days}\n`;
        }

        return report;
      };

      const handleExportCSV = () => {
        const csvRows = [];
        const headers = ['Member', 'Category', 'Reason', 'Start Time', 'End Time', 'Date', 'Day', 'Status'];
        csvRows.push(headers.join(','));

        requests.forEach((req) => {
          const values = [req.member, req.category, req.reason, req.startTime, req.endTime, req.date, req.day, req.status];
          csvRows.push(values.join(','));
        });

        const csvData = csvRows.join('\n');
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'time_off_requests.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      return (
        <div>
          <h1>PHBG - TIME OFF REQUEST TRACKER</h1>
          <h3>(General Shift - 9:00 AM to 6:30 PM | Lunch break 1 Hour | Tea Breaks 30 Mins)</h3>
          <div className="request-form">
            <h2>Request Time Off</h2>
            <form onSubmit={handleRequestSubmit}>
              <label>
                Team Member:
                <select value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)}>
                  {teamMembers.map((member) => (
                    <option key={member} value={member}>
                      {member}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Date:
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} required />
              </label>
              <label>
                Start Time:
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
              </label>
              <label>
                End Time:
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
              </label>
              <label>
                Category:
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Reason:
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} required />
              </label>
              <button type="submit">Submit Request</button>
            </form>
          </div>

          <div className="request-list">
            <div className="collapsible-header" onClick={() => handleToggleSection('pending')}>
              <h2>Pending Time Off Requests</h2>
              <span>{showPendingRequests ? '-' : '+'}</span>
            </div>
            <div className={`collapsible-content ${showPendingRequests ? '' : 'collapsed'}`}>
              <table>
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Date</th>
                    <th>Day</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Category</th>
                    <th>Reason</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests
                    .filter((req) => req.status === 'pending')
                    .map((req) => (
                      <tr key={req.id}>
                        <td>{req.member}</td>
                        <td>{req.date}</td>
                        <td>{req.day}</td>
                        <td>{req.startTime}</td>
                        <td>{req.endTime}</td>
                        <td>{req.category}</td>
                        <td>{req.reason}</td>
                        <td>
                          <button onClick={() => {
                            setSelectedRequestForApproval(req.id);
                          }}>Approve/Reject</button>
                          <button onClick={() => handleCancelRequest(req.id)}>Cancel</button>
                          <button onClick={() => handleOnHold(req.id)}>On Hold</button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {selectedRequestForApproval && (
            <div className="approval-form">
              <h2>Approve/Reject Request</h2>
              <label>
                Reason:
                <textarea value={approvalReason} onChange={(e) => setApprovalReason(e.target.value)} required />
              </label>
              <button onClick={() => handleApprove(selectedRequestForApproval)}>Approve</button>
              <button onClick={() => handleReject(selectedRequestForApproval)}>Reject</button>
            </div>
          )}

          <div className="approval-list">
            <div className="collapsible-header" onClick={() => handleToggleSection('approved')}>
              <h2>Approved/Rejected/Cancelled Time Off Requests</h2>
              <span>{showApprovedRequests ? '-' : '+'}</span>
            </div>
            <div className={`collapsible-content ${showApprovedRequests ? '' : 'collapsed'}`}>
              <table>
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Date</th>
                    <th>Day</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Category</th>
                    <th>Reason</th>
                    <th>Approval Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {approvals.map((approval) => {
                    const relatedRequest = requests.find(req => req.id === approval.requestId);
                    return (
                      <tr key={approval.id}>
                        <td>{approval.member}</td>
                        <td>{approval.date}</td>
                        <td>{approval.day}</td>
                        <td>{approval.startTime}</td>
                        <td>{approval.endTime}</td>
                        <td>{approval.category}</td>
                        <td>{approval.reason}</td>
                        <td>{approval.approvalReason}</td>
                        <td>{approval.status}</td>
                        <td>
                          {approval.status === 'approved' && (
                            <button onClick={() => handleCancelApproval(approval.id)}>Cancel Approval</button>
                          )}
                          {(approval.status === 'approved' || approval.status === 'rejected' || (relatedRequest && relatedRequest.status === 'cancelled')) && (
                            <button onClick={() => handleEditRequest(relatedRequest || {
                              id: approval.requestId,
                              member: approval.member,
                              date: approval.date,
                              startTime: approval.startTime,
                              endTime: approval.endTime,
                              category: approval.category,
                              reason: approval.reason,
                            })}>Edit</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          {editMode && (
            <div className="edit-form">
              <h2>Edit Request</h2>
              <label>
                Member:
                <select name="member" value={editedRequest.member} onChange={handleInputChange}>
                  {teamMembers.map((member) => (
                    <option key={member} value={member}>
                      {member}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Date:
                <input type="date" name="date" value={editedRequest.date} onChange={handleInputChange} />
              </label>
              <label>
                Start Time:
                <input type="time" name="startTime" value={editedRequest.startTime} onChange={handleInputChange} />
              </label>
              <label>
                End Time:
                <input type="time" name="endTime" value={editedRequest.endTime} onChange={handleInputChange} />
              </label>
              <label>
                Category:
                <select name="category" value={editedRequest.category} onChange={handleInputChange}>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Reason:
                <textarea name="reason" value={editedRequest.reason} onChange={handleInputChange} />
              </label>
              <button onClick={() => handleSaveEdit(editMode)}>Save</button>
              <button onClick={handleCancelEdit}>Cancel</button>
            </div>
          )}
          <div className="team-management">
            <div className="collapsible-header" onClick={() => handleToggleSection('team')}>
              <h2>Team Management</h2>
              <span>{showTeamManagement ? '-' : '+'}</span>
            </div>
            <div className={`collapsible-content ${showTeamManagement ? '' : 'collapsed'}`}>
              <input
                type="text"
                placeholder="New Member Name"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
              />
              <button onClick={handleAddMember} style={{marginLeft: '5px'}}>Add Member</button>
              <ul>
                {teamMembers.map((member) => (
                  <li key={member}>
                    {editMemberMode === member ? (
                      <>
                        <input
                          type="text"
                          value={editedMemberName}
                          onChange={(e) => setEditedMemberName(e.target.value)}
                        />
                        <button onClick={handleSaveMemberEdit}>Save</button>
                        <button onClick={handleCancelMemberEdit}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <span>{member}</span>
                        <div>
                          <button onClick={() => handleEditMember(member)}>Edit</button>
                          <button onClick={() => handleRemoveMember(member)}>Remove</button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="insights-section">
            <div className="collapsible-header" onClick={() => handleToggleSection('insights')}>
              <h2>Insights</h2>
              <span>{showInsights ? '-' : '+'}</span>
            </div>
            <div className={`collapsible-content ${showInsights ? '' : 'collapsed'}`}>
              <pre>{generateInsights()}</pre>
            </div>
          </div>
          <button onClick={handleExportCSV}>Export to CSV</button>
          <button onClick={generateInsights}>Generate Insights</button>
        </div>
      );
    };

    export default App;
