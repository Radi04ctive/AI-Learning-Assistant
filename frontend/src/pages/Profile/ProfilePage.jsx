import { useState, useEffect } from "react";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import authService from "../../services/authService.js";
import { useAuth } from "../../hooks/useAuth.js";
import toast from "react-hot-toast";
import { User, Mail, Lock } from "lucide-react";

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await authService.getProfile()
        setUsername(profile.user.username)
        setEmail(profile.user.email)
      } catch (error) {
        toast.error('Failed to fetch the user information.')
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleChangePassword = async(e) => {
    e.preventDefault()
    setPasswordLoading(true)

    if(newPassword !== confirmNewPassword){
      toast.error('New password do not maatch.')
      return
    }

    if(newPassword.length < 6){
      toast.error('New password must at least 6 characters long.')
      return
    }

    try {
      await authService.changePassword({currentPassword, newPassword})
      toast.success('Password Changed')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (error) {
      toast.error(error.mesaage || "Failed to change the password")
      console.error(error)
    } finally {
      setPasswordLoading(false)
    }
  };

  if(loading) {
    return <Spinner />
  }

  return (
    <div>
      <PageHeader title="Profile Setting" />

      <div className="space-y-8">
        {/* User Information Display */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">User Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="size-4 text-neutral-400" />
                </div>
                <p className="w-full h-9 pl-9 pr-3 pt-2 border border-neutral-200 rounded-lg bg-neutral-50 text-sm text-neutral-900">
                  {username}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="size-4 text-neutral-400" />
                </div>
                <p className="w-full h-9 pl-9 pr-3 pt-2 border border-neutral-200 rounded-lg bg-neutral-50 text-sm text-neutral-900">
                  {email}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Change Password</h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">Current Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-4 text-neutral-400" />
                </div>
                <input
                  type="password"
                  className="w-full h-9 pl-9 pr-3 pt-2 border border-neutral-200 rounded-lg bg-white text-4xl font-bold text-neutral-900 placeholder-neutral-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#00d492] focus:border-transparent"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-4 text-neutral-400" />
                </div>
                <input
                  type="password"
                  className="w-full h-9 pl-9 pr-3 pt-2 border border-neutral-200 rounded-lg bg-white text-4xl font-bold text-neutral-900 placeholder-neutral-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#00d492] focus:border-transparent"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">Confirm New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-4 text-neutral-400" />
                </div>
                <input
                  type="password"
                  className="w-full h-9 pl-9 pr-3 pt-2 border border-neutral-200 rounded-lg bg-white text-4xl font-bold text-neutral-900 placeholder-neutral-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#00d492] focus:border-transparent"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={passwordLoading}>
                {passwordLoading ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
