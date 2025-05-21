import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import axios from "axios";
import "./App.css";
import Header from "./Header";
import AddContact from "./AddContact.js";
import EditContact from "./EditContact.js";
import ContactList from "./ContactList.js";
import DarkMode from "./darkmode.js";
import ContactDetail from "./ContactDetail";

function App() {
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState({
    list: false,
    add: false,
    edit: false,
    delete: false
  });

  const getContacts = async () => {
    try {
      setLoading(prev => ({ ...prev, list: true }));
      const res = await axios.get("/api/contacts");
      setContacts(res.data);
    } catch (err) {
      console.log("Error from ContactList", err);
    } finally {
      setLoading(prev => ({ ...prev, list: false }));
    }
  };

  const addContactHandler = async (contact) => {
    try {
      setLoading(prev => ({ ...prev, add: true }));
      await axios.post("/api/contacts", contact);
      await getContacts();
    } catch (err) {
      console.log("Error from AddContact", err);
    } finally {
      setLoading(prev => ({ ...prev, add: false }));
    }
  };

  const updateContactHandler = async (contact) => {
    try {
      setLoading(prev => ({ ...prev, edit: true }));
      await axios.put("/api/contacts/" + contact._id, contact);
      await getContacts();
    } catch (err) {
      console.log("Error from UpdateContactInfo", err);
    } finally {
      setLoading(prev => ({ ...prev, edit: false }));
    }
  };

  const removeContactHandler = async (contact) => {
    try {
      setLoading(prev => ({ ...prev, delete: true }));
      await axios.delete("/api/contacts/" + contact._id, contact);
      await getContacts();
    } catch (err) {
      console.log("Error from RemoveContact", err);
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const searchHandler = (searchTerm) => {
    setSearchTerm(searchTerm);
    if (searchTerm.length > 0) {
      const newContactList = contacts.filter((contact) => {
        return Object.values(contact.name + " " + contact.email)
          .join("")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      });
      setSearchResults(newContactList);
    } else {
      setSearchResults(contacts);
    }
  };

  useEffect(() => {
    getContacts();
  }, []);

  // Loading spinner component
  const Spinner = () => (
    <div className="spinner-overlay">
      <div className="spinner-container">
        <div className="loading-spinner"></div>
      </div>
    </div>
  );

  return (
    <div className="App-container">
      {/* Show spinner when any operation is loading */}
      {(loading.list || loading.add || loading.edit || loading.delete) && <Spinner />}

      <Router>
        <Header />
        <Routes>
          <Route
            path="/"
            element={
              <ContactList
                contacts={searchTerm.length < 1 ? contacts : searchResults}
                getContactID={removeContactHandler}
                term={searchTerm}
                searchKeyword={searchHandler}
                isLoading={loading.delete}
              />
            }
          />
          <Route
            path="/add"
            element={
              <AddContact
                addContactHandler={addContactHandler}
                isLoading={loading.add}
              />
            }
          />
          <Route
            path="/edit/:id"
            element={
              <EditContact
                contacts={contacts}
                updateContactHandler={updateContactHandler}
                isLoading={loading.edit}
              />
            }
          />
          <Route
            path="/contact/:id"
            element={<ContactDetail contacts={contacts} />}
          />
        </Routes>
        <DarkMode />
      </Router>
    </div>
  );
}

export default App;