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
import Dexie, { Table } from "dexie";

// Define the Friend interface
interface Friend {
  id?: number; // Optional because it's auto-incremented by Dexie
  name: string;
  age: number;
}

// Initialize Dexie database
class MyDatabase extends Dexie {
  public friends!: Table<Friend, number>; // Table<Entity, PrimaryKeyType>

  constructor() {
    super("MyDatabase");
    this.version(1).stores({
      friends: "++id, name, age", // Primary key and indexed props
    });
  }
}

const db = new MyDatabase();

const DexieCRUD: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editAge, setEditAge] = useState<string>("");

  // Fetch all friends on component mount
  useEffect(() => {
    db.friends.toArray().then(setFriends);
  }, []);

  // Add a friend
  const addFriend = async () => {
    await db.friends.add({ name, age: parseInt(age, 10) });
    setName("");
    setAge("");
    setFriends(await db.friends.toArray());
  };

  // Delete a friend
  const deleteFriend = async (id: number) => {
    await db.friends.delete(id);
    setFriends(await db.friends.toArray());
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
      await db.friends.update(editId, {
        name: editName,
        age: parseInt(editAge, 10),
      });
      setEditId(null);
      setEditName("");
      setEditAge("");
      setFriends(await db.friends.toArray());
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Dexie.js CRUD
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

export default DexieCRUD;
