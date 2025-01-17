import { Box,Text, Button, Tooltip, MenuButton, Menu, Avatar, MenuList, MenuItem, MenuDivider, Drawer, useDisclosure, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, Input, useToast, Spinner } from '@chakra-ui/react';
import React, { useState } from 'react';
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { ChatState } from '../../Context/ChatProvider';
import ProfileModal from './ProfileModal';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import ChatLoading from '../ChatLoading';
import UserListItem from '../UserAvatar/UserListItem';
import { getSender } from '../../config/ChatLogics';
import NotificationBadge, { Effect } from "react-notification-badge";
//import { config } from 'dotenv';

const SideDrawer = ()=> {
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState(false);
  
    const { user, setSelectedChat, chats, setChats,notification,setNotification } = ChatState();
  
    const history = useHistory();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();
  
    const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    history.push("/");
  };
    
    const handleSearch = async () => {
      if (!search) {
        //console.log("emptyuser");
        toast({
          title: "Please enter something in search", status: "warning",
          duration: 5000,
          isClosable: true,
          position: "top-left",
        });
        return;
      }
      try {
        setLoading(true);
        // console.log("founduser");
        // console.log("User Token:", user.token);

        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.get(`/api/user?search=${search}`, config);  
        // const { data } = await axios.get(
        //   `http://localhost:5000/api/user?search=${search}`,
        //   config
        // );
        setLoading(false);
        setSearchResult(data);
        

      } catch (error) {
        // console.error(
        //   "Search error:",
        //   error.response ? error.response.data : error.message
        // );
        toast({
          title: "Error Occured!",
          description:"Failed to Load the Search Results",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom-left",
        });
       // setLoading(false);
      }
    };
  const accessChat = async (userId) => {
      console.log(userId);
      try {
        setLoadingChat(true);

        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.post(`/api/chat`, { userId }, config);
        if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
        setSelectedChat(data);
        setLoadingChat(false);
        onClose();
      } catch (error) {
        toast({
          title: "Error fetching the chat",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom-left",
        });
      }
  };
      return (
        <>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            bg="white"
            w="100%"
            p="5px 10px 5px 10px"
            borderWidth="5px"
          >
            <Tooltip
              label="Search Users to chat"
              hasArrow
              placement="bottom-end"
            >
              <Button variant="ghost" onClick={onOpen}>
                <i class="fas fa-search"></i>
                <Text d={{ base: "none", md: "flex" }} px="4">
                  Search User
                </Text>
              </Button>
            </Tooltip>
            <Text fontSize="2xl" fontFamily="Work sans">
              Talk-A-Tive
            </Text>
            <div>
              <Menu>
                <MenuButton p={1}>
                  <NotificationBadge
                    count={notification.length}
                    effect={Effect.SCALE}
                  />
                  <BellIcon fontSize="2xl" m={1} />
                </MenuButton>
                <MenuList pl={2}>
                  {!notification.length && "No New Messages"}
                  {notification.map((notif) => (
                    <MenuItem
                      key={notif._id}
                      onClick={() => {
                        setSelectedChat(notif.chat);
                        setNotification(
                          notification.filter((n) => n !== notif)
                        );
                      }}
                    >
                      {notif.chat.isGroupChat
                        ? `New Message in ${notif.chat.chatName}`
                        : `New Message from ${getSender(
                            user,
                            notif.chat.users
                          )}`}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
              <Menu>
                <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                  <Avatar
                    size="sm"
                    cursor="pointer"
                    name={user.name}
                    src={user.pic}
                  />
                </MenuButton>
                <MenuList>
                  <ProfileModal user={user}>
                    <MenuItem>My Profile</MenuItem>{" "}
                  </ProfileModal>

                  <MenuDivider />
                  <MenuItem onClick={logoutHandler}>Logout</MenuItem>
                </MenuList>
              </Menu>
            </div>
          </Box>
          <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
            <DrawerOverlay />
            <DrawerContent>
              <DrawerHeader borderBottomWidth="1px"> Search Users</DrawerHeader>
              <DrawerBody>
                <Box d="flex" pb={2}>
                  <Input
                    placeholder="Search by name or email"
                    mr={2}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Button onClick={handleSearch}> Go</Button>
                </Box>
                {loading ? (
                  <ChatLoading />
                ) : (
                  searchResult?.map((user) => (
                    <UserListItem
                      key={user._id}
                      user={user}
                      handleFunction={() => accessChat(user._id)}
                    />
                  ))
                )}
                {loadingChat && <Spinner ml="auto" d="flex" />}
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        </>
      );
  };

export default SideDrawer;
