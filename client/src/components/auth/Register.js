import e from "express";
import React, { Fragment, useState } from "react";
import {Link} from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
      password2: ''
  });

  const {name, email, password, password2} = formData;
  const onChange = () => setFormData({...formData, [e.target.name]: e.target.value});

  return (
    <Fragment>
      <h1 class="large text-primary">Sign Up</h1>
      <p class="lead">
        <i class="fas fa-user"></i> Create Your Account
      </p>
      <form class="form" action="create-profile.html">
        <div class="form-group">
          <input type="text" placeholder="Name" name="name" value={name} onChange={e => onChange(e)} required />
        </div>
        <div class="form-group">
          <input type="email" placeholder="Email Address" name="email" />
          <small class="form-text">
            This site uses Gravatar so if you want a profile image, use a
            Gravatar email
          </small>
        </div>
        <div class="form-group">
          <input
            type="password"
            placeholder="Password"
            name="password"
            minLength="6"
          />
        </div>
        <div class="form-group">
          <input
            type="password"
            placeholder="Confirm Password"
            name="password2"
            minLength="6"
          />
        </div>
        <input type="submit" class="btn btn-primary" value="Register" />
      </form>
      <p class="my-1">
        Already have an account? <Link to="/login">Sign In</Link>
      </p>
    </Fragment>
  );
};

export default Register;