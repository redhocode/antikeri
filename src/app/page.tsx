"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { User } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import toast,{ Toaster} from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
const HomePage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [checktime, setChecktime] = useState<string>("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // State loading

  // Initialize sensorId with a default value of "1"
  const sensorId = "1";
  const SN = "A5NS190560046";

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true); // Set loading to true before fetching data
      try {
        const response = await axios.get<User[]>("/api/users");
        setUsers(response.data);
        toast.success("Users fetched successfully");
      } catch (error) {
        setError("Failed to fetch users");
        toast.error("Failed to fetch users");
      } finally {
        setLoading(false); // Set loading to false after fetching data
        // toast.dismiss();
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
        sensorId: sensorId, // Always set sensorId to "1"
        sn: SN,
      });
      setSubmitSuccess("Check-in/check-out time added successfully.");
      setSubmitError(null);
    } catch (error) {
      setSubmitError("Failed to submit data.");
      setSubmitSuccess(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 gap-4">
      <Card className="w-[400px]">
        <CardHeader>
          <h1 className="text-3xl font-bold items-center justify-center mx-auto">
            Antikeri
          </h1>
        </CardHeader>
        <CardContent>
          <div className="gap-4">
            {loading && <p>Loading...</p>} {/* Tampilkan indikator loading */}
            {error && <p>{error}</p>}
            {submitError && <p style={{ color: "red" }}>{submitError}</p>}
            {submitSuccess && <p style={{ color: "green" }}>{submitSuccess}</p>}
            {/* <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                
              {users.map((user) => (
                <optio key={user.USERID} value={user.USERID}>
                  {user.Name}
                </optio>
              ))}
              </SelectContent>
            </Select> */}
            <select
              onChange={handleChange}
              defaultValue=""
              className="w-full py-2"
            >
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
              <div className="gap-2">
                <h3>Selected User</h3>
                <p>ID: {selectedUser.USERID}</p>
                <Badge variant="destructive">
                  <p className="text-lg font-semibold">{selectedUser.Name}</p>
                </Badge>

                {/* Display more details if needed */}

                <form onSubmit={handleSubmit}>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="checktime">Check-in/Check-out Time:</label>
                    <Input
                      className="w-full items-center justify-center outline-blue-500 outline"
                      type="datetime-local"
                      id="checktime"
                      value={checktime}
                      onChange={handleChecktimeChange}
                    />
                  </div>
                  <Button
                    variant="default"
                    type="submit"
                    className="w-full mt-4"
                  >
                    Submit
                  </Button>
                </form>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter></CardFooter>
      </Card>
    </div>
  );
};

export default HomePage;
