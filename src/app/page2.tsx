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
import toast, { Toaster } from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandInput,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command";

const HomePage: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [checktime, setChecktime] = useState<string>("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [dbLoading, setDbLoading] = useState<boolean>(true);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [password, setPassword] = useState<string>(""); // For storing password input
  const [passwordVerified, setPasswordVerified] = useState<boolean>(false); // To track if the password is correct

  const sensorId = "1";
  const SN = "A5NS190560046";
  const allowedUsers: User[] = [
    {
      USERID: 8597,
      Name: "Redho Arifin",
      SENSORID: sensorId,
      VERIFCODE: SN,
    },
    {
      USERID: 8378,
      Name: "User 2",
      SENSORID: sensorId,
      VERIFCODE: SN,
    },
    {
      USERID: 7878,
      Name: "User 3",
      SENSORID: sensorId,
      VERIFCODE: SN,
    },
  ];

  useEffect(() => {
    const checkDatabaseConnection = async () => {
      setDbLoading(true);
      try {
        await axios.get("/api/users");
        setDbConnected(true);
        toast.success("Connected to the database!");
      } catch (error) {
        setDbConnected(false);
        toast.error("Failed to connect to the database.");
      } finally {
        setDbLoading(false);
      }
    };

    checkDatabaseConnection();
  }, []);

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
      setLoading(true);

      const localDate = new Date(checktime);
      const jakartaTime = new Date(localDate.getTime() + 7 * 60 * 60 * 1000);
      const formattedDate = jakartaTime
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      await axios.post("/api/users", {
        userId: selectedUser.USERID,
        checktime: formattedDate,
        sensorId: sensorId,
        sn: SN,
      });

      setSubmitSuccess("Check-in/check-out time added successfully.");
      setSubmitError(null);
    } catch (error) {
      setSubmitError("Failed to submit data.");
      setSubmitSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const correctPassword = '2027'; 
    if (password === correctPassword) {
      setPasswordVerified(true);
    } else {
      toast.error("Incorrect password.");
    }
  };

  if (!passwordVerified) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2 gap-4">
        <Card className="w-[400px]">
          <CardHeader>
            <h1 className="text-3xl font-bold items-center justify-center mx-auto">
              Enter Password
            </h1>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit}>
              <div className="flex flex-col gap-2">
                <label htmlFor="password">Password:</label>
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button variant="default" type="submit" className="w-full mt-4">
                Submit
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            {dbLoading && <p>Cek Koneksi ke Database...</p>}
            {dbConnected === false && !dbLoading && (
              <p style={{ color: "red" }}>Gagal terhubung ke database.</p>
            )}
            {submitError && <p style={{ color: "red" }}>{submitError}</p>}
            {submitSuccess && <p style={{ color: "green" }}>{submitSuccess}</p>}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={true}
                  className="w-full justify-between py-2"
                >
                  {selectedUser ? selectedUser.Name : "Pilih User"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search user..." />
                  <CommandList>
                    <CommandEmpty>No user found.</CommandEmpty>
                    <CommandGroup>
                      {allowedUsers.map((user) => (
                        <CommandItem
                          key={user.USERID}
                          value={user.Name}
                          onSelect={(currentValue) => {
                            setSelectedUser(
                              allowedUsers.find(
                                (user) => user.Name === currentValue
                              ) || null
                            );
                          }}
                        >
                          <Check
                            className="mr-2 h-4 w-4"
                            style={{
                              opacity:
                                selectedUser?.Name === user.Name ? "100" : "0",
                            }}
                          />
                          {user.Name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {selectedUser && (
              <div className="gap-2 mt-4">
                <h3>Selected User</h3>
                <p>ID: {selectedUser.USERID}</p>
                <Badge variant="destructive">
                  <p className="text-lg font-semibold">{selectedUser.Name}</p>
                </Badge>

                <form onSubmit={handleSubmit}>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="checktime">Check-in:</label>
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
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Submit"}
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
