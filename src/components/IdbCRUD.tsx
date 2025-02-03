import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  Container,
  Typography,
} from "@mui/material";
import { openDB, DBSchema, IDBPDatabase } from "idb";

// Define the Friend interface
interface Friend {
  id?: number; // Optional because it's auto-incremented by IndexedDB
  name: string;
  age: number;
}

// Define the database schema
interface MyDatabase extends DBSchema {
  friends: {
    key: number;
    value: Friend;
  };
}

// Initialize IndexedDB
const initDB = async (): Promise<IDBPDatabase<MyDatabase>> => {
  return openDB<MyDatabase>("MyDatabase", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("friends")) {
        db.createObjectStore("friends", { keyPath: "id", autoIncrement: true });
      }
    },
  });
};

const IdbCRUD: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editAge, setEditAge] = useState<string>("");

  // Fetch all friends on component mount
  useEffect(() => {
    const fetchFriends = async () => {
      const db = await initDB();
      const allFriends = await db.getAll("friends");
      setFriends(allFriends);
    };
    fetchFriends();
  }, []);

  // Add a friend
  const addFriend = async () => {
    const db = await initDB();
    await db.add("friends", { name, age: parseInt(age, 10) });
    setName("");
    setAge("");
    setFriends(await db.getAll("friends"));
  };

  // Delete a friend
  const deleteFriend = async (id: number) => {
    const db = await initDB();
    await db.delete("friends", id);
    setFriends(await db.getAll("friends"));
  };

  // Edit a friend
  const editFriend = (friend: Friend) => {
    setEditId(friend.id!);
    setEditName(friend.name);
    setEditAge(friend.age.toString());
  };

  // Update a friend
  const updateFriend = async () => {
    if (editId !== null) {
      const db = await initDB();
      await db.put("friends", {
        id: editId,
        name: editName,
        age: parseInt(editAge, 10),
      });
      setEditId(null);
      setEditName("");
      setEditAge("");
      setFriends(await db.getAll("friends"));
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        idb CRUD
      </Typography>
      <TextField
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Age"
        type="number"
        value={age}
        onChange={(e) => setAge(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button variant="contained" color="primary" onClick={addFriend}>
        Add Friend
      </Button>
      <List>
        {friends.map((friend) => (
          <ListItem key={friend.id}>
            {editId === friend.id ? (
              <>
                <TextField
                  label="Edit Name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Edit Age"
                  type="number"
                  value={editAge}
                  onChange={(e) => setEditAge(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                <Button color="primary" onClick={updateFriend}>
                  Update
                </Button>
                <Button onClick={() => setEditId(null)}>Cancel</Button>
              </>
            ) : (
              <>
                <ListItemText
                  sx={{ color: "black" }}
                  primary={`${friend.name} (${friend.age})`}
                />
                <Button
                  color="secondary"
                  onClick={() => deleteFriend(friend.id!)}
                >
                  Delete
                </Button>
                <Button onClick={() => editFriend(friend)}>Edit</Button>
              </>
            )}
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default IdbCRUD;
