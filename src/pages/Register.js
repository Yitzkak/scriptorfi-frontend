function Register() {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [message, setMessage] = useState('');
  
    const handleRegister = async (e) => {
      e.preventDefault();
      try {
        const response = await axios.post('http://127.0.0.1:8000/api/register/', formData);
        setMessage(response.data.message);
      } catch (err) {
        setMessage(err.response.data.error || 'An error occurred');
      }
    };
  
    return (
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
        <button type="submit">Register</button>
        {message && <p>{message}</p>}
      </form>
    );
  }
  
  export default Register;
  