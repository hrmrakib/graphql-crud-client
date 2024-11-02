import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Loading from "./Loading";
import { useQuery, gql } from "@apollo/client";

const USERS_QUERY = gql`
  query get_Users {
    users {
      name
      email
    }
  }
`;

function Users() {
  const [nameError, setNameError] = useState("");
  const [openUserModal, setOpenUserModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);

  const [onChangeUpdateName, setOnChangeUpdateName] = useState("");
  const [onChangeUpdateEmail, setOnChangeUpdateEmail] = useState("");
  const [targetedUserEmail, setTargetedUserEmail] = useState("");
  const [updateError, setUpdateError] = useState({
    nameError: "",
    emailError: "",
  });

  const {
    loading,
    error,
    data: { users = [] },
  } = useQuery(USERS_QUERY);

  if (loading) return <Loading />;

  if (error) return <p>{error.message}</p>;

  console.log(users && users);

  const handleCreateUser = (e) => {
    e.preventDefault();
    setNameError("");

    const userName = e.target.name.value.trim();
    const userEmail = e.target.email.value;

    if (userName.length < 3) {
      return setNameError("Name must be 3 characters");
    }

    setTimeout(() => {
      return setOpenUserModal(false);
    }, 999);
  };

  const handleUpdateUser = (user) => {
    setOpenUpdateModal(true);

    const { name, email } = user;
    console.log("every ", name, email);

    setOnChangeUpdateName(name);
    setOnChangeUpdateEmail(email);
    setTargetedUserEmail(email);
  };

  const handleUpdateUserSubmit = (e) => {
    e.preventDefault();
    setUpdateError({
      nameError: "",
      emailError: "",
    });

    const updatedUserInfo = { onChangeUpdateName, onChangeUpdateEmail };
    if (onChangeUpdateName.length < 3) {
      return setUpdateError({
        ...updateError,
        nameError: "Update name must 3 characters",
      });
    }
    const emailCheck = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailCheck.test(onChangeUpdateEmail)) {
      return setUpdateError({
        ...updateError,
        emailError: "Invalid email!",
      });
    }

    axiosPublic
      .put(`/update/${targetedUserEmail}`, updatedUserInfo)
      .then((res) => {
        if (res.data.message === "success") {
          refetch();
          toast.success("Updated successfully!");
          setOpenUpdateModal(false);
        }
      })
      .catch((err) => {
        toast.error(err);
      });
  };

  const handleDelete = (user) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosPublic
          .delete(`/delete/${user?.email}`)
          .then((res) => {
            console.log(res.data);
            if (res.data?.affectedRows) {
              refetch();
              Swal.fire({
                title: "Deleted!",
                text: `${user?.name} has been deleted.`,
                icon: "success",
              });
            }
          })
          .catch((err) => {
            toast.error(err);
          });
      }
    });
  };

  return (
    <div className='table_container'>
      <Toaster position='top-center' reverseOrder={false} />
      <div className='header_box'>
        <h2 className='container_heading'>Users Information</h2>
        <button onClick={() => setOpenUserModal(true)} className='btn'>
          Add
        </button>
      </div>
      <table className='table'>
        <thead>
          <tr>
            <th className='t_heading'>#</th>
            <th className='t_heading'>Name</th>
            <th className='t_heading'>Email</th>
            <th className='t_heading action_end'>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr className='tbody_row'>
            {true && (
              <td
                style={{
                  width: "100px",
                  height: "100px",
                  margin: "20px auto",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Loading />
              </td>
            )}
          </tr>
          {users?.map((user, index) => (
            <tr key={index} className='tbody_row'>
              <td className='tbody_data'>{index + 1}</td>
              <td className='tbody_data'>{user?.name}</td>
              <td className='tbody_data'>{user?.email}</td>

              <td className='tbody_data'>
                <div className='action'>
                  <button
                    onClick={() => handleUpdateUser(user)}
                    className='btn update_button'
                  >
                    Update
                  </button>

                  <button
                    onClick={() => handleDelete(user)}
                    className='btn delete_button'
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Create user form */}
      {openUserModal && (
        <div className='create_user'>
          <div className='create_user_heading'>
            <h2>Create a new user</h2>
            <div
              onClick={() => setOpenUserModal(false)}
              className='close_user_modal'
            >
              Close
            </div>
          </div>
          <form onSubmit={handleCreateUser} className='user_form'>
            <input type='text' name='name' placeholder='Enter name' required />
            <p className='error'>{nameError}</p>
            <input
              type='email'
              name='email'
              placeholder='Enter email'
              required
            />
            <button type='submit' className='btn submit_btn'>
              Submit
            </button>
          </form>
        </div>
      )}

      {/* update user info */}
      {openUpdateModal && (
        <div className='create_user'>
          <div className='create_user_heading'>
            <h2>Update the user</h2>
            <div
              onClick={() => setOpenUpdateModal(false)}
              className='close_user_modal'
            >
              Close
            </div>
          </div>
          <form onSubmit={handleUpdateUserSubmit} className='user_form'>
            <input
              type='text'
              value={onChangeUpdateName}
              onChange={(e) => setOnChangeUpdateName(e.target.value)}
              name='updateName'
              placeholder='Enter name'
              required
            />
            <p className='error'>{updateError.nameError}</p>
            <input
              type='email'
              name='updateEmail'
              onChange={(e) => setOnChangeUpdateEmail(e.target.value)}
              value={onChangeUpdateEmail}
              placeholder='Enter email'
              required
            />
            <p className='error'>{updateError.emailError}</p>

            <button type='submit' className='btn submit_btn'>
              Update
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Users;
