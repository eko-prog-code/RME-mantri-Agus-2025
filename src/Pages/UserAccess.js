// UserAccess.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "./auth";
import Button from "../components/ui/Button";
import { FaSquareWhatsapp } from "react-icons/fa6";
import MedicalLogo from "../Images/medical.png";
import InstallPrompt from '../components/InstallPrompt';

const UserAccess = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordCorrect, setPasswordCorrect] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const waNumber = "+62895600394345";

  const handleChatButtonClick = () => {
    window.open(`https://wa.me/${waNumber}`, "_blank");
  };

  const correctPasswordFromSourceCode = "24";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Ambil token dari localStorage atau ambil baru jika belum ada
      const accessToken =
        localStorage.getItem("accessToken") || (await getToken());

      // Periksa apakah password yang dimasukkan sesuai dengan yang ditetapkan di source code
      const isPasswordCorrect = password === correctPasswordFromSourceCode;
      setPasswordCorrect(isPasswordCorrect);
      setLoading(false);

      if (isPasswordCorrect) {
        // Redirect ke halaman Home
        navigate("/home");
      } else {
        // Password salah, set pesan kesalahan
        setError("Password Salah. Silakan coba lagi.");
      }
    } catch (error) {
      // Tangani kesalahan saat mengambil token
      console.error("Error:", error);
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      {loading ? (
        <div className="h-screen bg-white">
          <div className="flex justify-center items-center h-full">
            <img className="h-32 w-32" src="/Animation.gif" alt="loading " />
          </div>
        </div>
      ) : (
        <>
          <div className="flex h-screen">
            <div className="hidden lg:flex items-center justify-center flex-1 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-black">
              <div className="max-w-md text-center">
                <img src={MedicalLogo} alt="logo medical" />
              </div>
            </div>

            <div className="w-full bg-gradient-to-r from-rose-100 to-teal-100 lg:w-1/2 flex items-center justify-center">
              <div className="max-w-md w-full p-6">
                <h1 className="text-3xl font-semibold mb-6 text-black text-center">
                RME Mantri Agus
                </h1>

                <p className="text-sm font-semibold mb-6 text-gray-500 text-center">
                  Menemukan Kendala?{" "}
                  <span className="inline-flex">
                    Chat IT on{" "}
                    <FaSquareWhatsapp
                      className="ml-3 w-8 h-8 animate-bounce text-green-500 cursor-pointer"
                      onClick={handleChatButtonClick}
                    />
                  </span>{" "}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Masukkan Password:
                    </label>
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      className="mt-1 p-2 w-full border rounded-md focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors duration-300"
                    />
                  </div>
                  <div>
                    <label className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        className="mr-2 w-4 h-4"
                        checked={showPassword}
                        onChange={togglePasswordVisibility}
                      />
                      <span className="text-sm text-gray-600">
                        Show password
                      </span>
                    </label>
                  </div>
                  {correctPasswordFromSourceCode ? (
                    ""
                  ) : (
                    <span className="mt-2  text-sm text-red-500 ">
                      Password: {correctPasswordFromSourceCode}
                    </span>
                  )}
                  {error && (
                    <>
                      <p className="mt-2  text-sm text-red-500">
                        {error} ketik password : {correctPasswordFromSourceCode}{" "}
                      </p>{" "}
                    </>
                  )}
                  <div>
                    <Button
                      type="submit"
                      className="w-full bg-black text-white p-2 rounded-md hover:bg-gray-800 focus:outline-none focus:bg-black focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-300"
                    >
                      Login
                    </Button>
                  </div>
                </form>
                <div className="mt-4 text-sm text-gray-600 text-center">
                  <p>MedicTech RME (PT.InnoView Indo Tech)</p>
                </div>
                <InstallPrompt />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default UserAccess;
