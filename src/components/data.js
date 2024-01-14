import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './data.css'

const SatResults = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatedScores, setUpdatedScores] = useState({});
  const [editMode, setEditMode] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [newStudentData, setNewStudentData] = useState({
    name: '',
    address: '',
    city: '',
    country: '',
    pincode: '',
    sat_score: '',
  });

  const [submittedData, setSubmittedData] = useState(null);

  const fetchRank = async (name) => {
    try {
      const rankResponse = await axios.get(`http://127.0.0.1:8000/results/get_rank/${name}`);
      return rankResponse.data.rank;
    } catch (error) {
      console.error(`Error fetching rank for ${name}: ${error.message}`);
      return null;
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/results/view_all_Data');
      if (response.status === 200) {
        const studentData = response.data.data;
        const studentsWithRank = await Promise.all(
          studentData.map(async (student) => {
            const rank = await fetchRank(student.name);
            return { ...student, rank };
          })
        );
        setData(studentsWithRank);
        setError(null);
        setUpdatedScores({});
        setEditMode({});
      } else {
        setError(`Request failed with status code ${response.status}`);
      }
    } catch (error) {
      setError(`Error fetching data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (name) => {
    try {
      const response = await axios.delete(`http://127.0.0.1:8000/results/${name}`);
      if (response.status === 200) {
        fetchData();
      } else {
        setError(`Request failed with status code ${response.status}`);
      }
    } catch (error) {
      setError(`Error deleting data: ${error.message}`);
    }
  };

  const handleUpdate = (name) => {
    setEditMode((prevEditMode) => ({ ...prevEditMode, [name]: true }));
  };

  const saveUpdate = async (name) => {
    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/results/update_score/${name}?updated_score=${updatedScores[name]}`,
      );

      if (response.status === 200) {
        fetchData();
        setEditMode((prevEditMode) => ({ ...prevEditMode, [name]: false }));
      } else {
        setError(`Request failed with status code ${response.status}`);
      }
    } catch (error) {
      setError(`Error updating data: ${error.message}`);
    }
  };

  const handleInputChange = (name, value) => {
    setUpdatedScores((prevScores) => ({ ...prevScores, [name]: value }));
  };


  const addStudent = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/results/insert_data', newStudentData);
      if (response.status === 201) {
        setNewStudentData({
          name: '',
          address: '',
          city: '',
          country: '',
          pincode: '',
          sat_score: '',
        });

        await fetchData();

        setSubmittedData(response.data);

        setShowForm(false);
      } else {
        setError(`Request failed with status code ${response.status}`);
      }
    } catch (error) {
      setError(`Error adding student: ${error.message}`);
    }
  };

  const handleAdd = () => {
    setShowForm(true);
  };

  return (
    <div>
      <h1>SAT Results</h1>
      {loading && <p>Loading...</p>}
      {error ? (
        <p>{error}</p>
      ) : (
        data && (
          <>
            <button onClick={handleAdd}>Add Data</button>
            {showForm && (
              <form onSubmit={(e) => { e.preventDefault(); addStudent(); }}>
                <label>
                  Name:
                  <input
                    type="text"
                    value={newStudentData.name}
                    onChange={(e) => setNewStudentData({ ...newStudentData, name: e.target.value })}
                  />
                </label>
                <label>
                  Address:
                  <input
                    type="text"
                    value={newStudentData.address}
                    onChange={(e) => setNewStudentData({ ...newStudentData, address: e.target.value })}
                  />
                </label>
                <label>
                  City:
                  <input
                    type="text"
                    value={newStudentData.city}
                    onChange={(e) => setNewStudentData({ ...newStudentData, city: e.target.value })}
                  />
                </label>
                <label>
                  Country:
                  <input
                    type="text"
                    value={newStudentData.country}
                    onChange={(e) => setNewStudentData({ ...newStudentData, country: e.target.value })}
                  />
                </label>
                <label>
                  Pincode:
                  <input
                    type="text"
                    value={newStudentData.pincode}
                    onChange={(e) => setNewStudentData({ ...newStudentData, pincode: e.target.value })}
                  />
                </label>
                <label>
                  SAT Score:
                  <input
                    type="text"
                    value={newStudentData.sat_score}
                    onChange={(e) => setNewStudentData({ ...newStudentData, sat_score: e.target.value })}
                  />
                </label>
                <button type="submit">Submit</button>
              </form>
            )}
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Address</th>
                  <th>City</th>
                  <th>Country</th>
                  <th>Pincode</th>
                  <th>SAT score</th>
                  <th>Passed</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.id}>
                    <td>{row.name}</td>
                    <td>{row.address}</td>
                    <td>{row.city}</td>
                    <td>{row.country}</td>
                    <td>{row.pincode}</td>
                    <td>
                      {editMode[row.name] ? (
                        <input
                          type="number"
                          placeholder="Enter updated score"
                          value={updatedScores[row.name] || ''}
                          onChange={(e) => handleInputChange(row.name, e.target.value)}
                        />
                      ) : (
                        row.sat_score
                      )}
                    </td>
                    <td>{row.passed}</td>
                    <td>
                      {editMode[row.name] ? (
                        <button onClick={() => saveUpdate(row.name)}>Save</button>
                      ) : (
                        <>
                          <button onClick={() => handleUpdate(row.name)}>Update</button>
                          <button onClick={() => handleDelete(row.name)}>Delete</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )
      )}
</div>  
 )}

export default SatResults;
