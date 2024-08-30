"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { User } from "@/lib/types";

const HomePage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [checktime, setChecktime] = useState<string>("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get<User[]>("/api/users");
        setUsers(response.data);
      } catch (error) {
        setError("Failed to fetch users");
      }
    };

    fetchUsers();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUserId = Number(event.target.value);
    const user = users.find((user) => user.USERID === selectedUserId) || null;
    setSelectedUser(user);
  };

  const handleChecktimeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setChecktime(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedUser || !checktime) {
      setSubmitError(
        "Please select a user and enter a check-in/check-out time."
      );
      return;
    }

    try {
      // Mengonversi waktu dari input ke zona waktu Indonesia
      const localDate = new Date(checktime);

      // Dapatkan offset WIB (UTC+7) dalam milidetik
      const jakartaOffsetMillis = 7 * 60 * 60 * 1000;
      const jakartaTime = new Date(localDate.getTime() + jakartaOffsetMillis);

      // Format waktu ke format string YYYY-MM-DD HH:MM:SS
      const year = jakartaTime.getFullYear();
      const month = String(jakartaTime.getMonth() + 1).padStart(2, "0");
      const day = String(jakartaTime.getDate()).padStart(2, "0");
      const hours = String(jakartaTime.getHours()).padStart(2, "0");
      const minutes = String(jakartaTime.getMinutes()).padStart(2, "0");
      const seconds = String(jakartaTime.getSeconds()).padStart(2, "0");

      const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

      await axios.post("/api/users", {
        userId: selectedUser.USERID,
        checktime: formattedDate,
      });
      setSubmitSuccess("Check-in/check-out time added successfully.");
      setSubmitError(null);
    } catch (error) {
      setSubmitError("Failed to submit data.");
      setSubmitSuccess(null);
    }
  };

  return (
    <div>
      <h1>Users</h1>
      {error && <p>{error}</p>}
      {submitError && <p style={{ color: "red" }}>{submitError}</p>}
      {submitSuccess && <p style={{ color: "green" }}>{submitSuccess}</p>}

      <select onChange={handleChange} defaultValue="">
        <option value="" disabled>
          Select a user
        </option>
        {users.map((user) => (
          <option key={user.USERID} value={user.USERID}>
            {user.Name}
          </option>
        ))}
      </select>

      {selectedUser && (
        <div>
          <h2>Selected User</h2>
          <p>ID: {selectedUser.USERID}</p>
          <p>Name: {selectedUser.Name}</p>
         
          {/* Display more details if needed */}

          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="checktime">Check-in/Check-out Time:</label>
              <input
                type="datetime-local"
                id="checktime"
                value={checktime}
                onChange={handleChecktimeChange}
              />
            </div>
            <button type="submit">Submit</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default HomePage;
