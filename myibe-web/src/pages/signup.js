import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    venueName: '',
    venueType: '',
    address: '',
    role: '',
    password: '',
    confirmPassword: '',
  });

  const navigate = useNavigate();

  const { name, email, phone, venueName, venueType, address, role, password, confirmPassword } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
  
    try {
      const res = await axios.post('http://localhost:5000/api/auth/signup', formData);
      const { token, userId, userName } = res.data; // Destructure userId and userName from response data
  
      // Store token, userId, and username in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('userName', userName);
  
      // Redirect based on venueType
      if (venueType === "admin") {
        navigate('/r-dashboard');
      } else if (venueType === "club") {
        navigate('/club-dashboard');
      } else {
        navigate('/r-dashboard');
      }
    } catch (err) {
      console.error(err.response.data);
      alert(err.response.data.msg);
    }
  };
  
  return (
    <section className="signup">
      <div className="container py-5 h-100">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col-12 col-md-8 col-lg-6 col-xl-5">
            <div className="card shadow-2-strong second">
              <div className="card-body p-5 text-center">
                <h3 className="mb-5">Create An Account</h3>
                <form onSubmit={onSubmit}>
                  <div className="form-outline mb-4">
                    <label className="form-label">Name</label>
                    <input type="text" name="name" required placeholder="Enter Your Name" className="form-control form-control-lg" value={name} onChange={onChange} />
                  </div>

                  <div className="form-outline mb-4">
                    <label className="form-label">Email</label>
                    <input type="email" name="email" required placeholder="Enter Your Email" className="form-control form-control-lg" value={email} onChange={onChange} />
                  </div>

                  <div className="form-outline mb-4">
                    <label className="form-label">Phone Number</label>
                    <input type="text" name="phone" required placeholder="Enter Phone Number" className="form-control form-control-lg" value={phone} onChange={onChange} />
                  </div>

                  <div className="form-outline mb-4">
                    <label className="form-label">Name Of Venue</label>
                    <input type="text" name="venueName" required placeholder="Name Of Venue" className="form-control form-control-lg" value={venueName} onChange={onChange} />
                  </div>

                  <div className="form-outline mb-4">
                    <label className="form-label">Type Of Venue</label>
                    <select name="venueType" required className="form-control form-control-lg" value={venueType} onChange={onChange}>
                      <option value="">Select type of your venue</option>
                      <option value="Restaurant">Restaurant</option>
                      <option value="Bar">Bar</option>
                      <option value="Café">Café</option>
                      <option value="club">Club</option>
                      <option value="Bowling">Bowling</option>
                      <option value="Barbershop">Barbershop</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-outline mb-4">
                    <label className="form-label">Address Of Venue</label>
                    <input type="text" name="address" required placeholder="Address Of Venue" className="form-control form-control-lg" value={address} onChange={onChange} />
                  </div>

                  <div className="form-outline mb-4">
                    <label className="form-label">Your Role in the Venue</label>
                    <input type="text" required name="role" placeholder="Your Role in the Venue" className="form-control form-control-lg" value={role} onChange={onChange} />
                  </div>

                  <div className="form-outline mb-4">
                    <label className="form-label" htmlFor="typePasswordX-2">Password</label>
                    <input type="password" required name="password" placeholder="Enter Your Password" className="form-control form-control-lg" value={password} onChange={onChange} />
                  </div>

                  <div className="form-outline mb-4">
                    <label className="form-label" htmlFor="typePasswordX-2">Confirm Password</label>
                    <input type="password" required name="confirmPassword" placeholder="Confirm Your Password" className="form-control form-control-lg" value={confirmPassword} onChange={onChange} />
                  </div>

                  <div className="form-check d-flex justify-content-start mb-4">
                    <input className="form-check-input" type="checkbox" value="" id="form1Example3" />
                    <label className="form-check-label" htmlFor="form1Example3"><Link to="/conditions" className='text-light'> Accept our Conditions of use </Link></label>
                  </div>

                  <button className="btn btn-danger btn-lg btn-block" type="submit">Create an account</button>
                </form>

                <hr className="my-4" />

                <h5 className='mt-4'>Already Have an Account <Link to="/login" className='text-danger'>Login Here</Link></h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Signup;
