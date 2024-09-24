import { Popover } from '@radix-ui/react-popover'
import React from 'react'
import { PopoverContent, PopoverTrigger } from '../ui/popover'
import { Avatar, AvatarImage } from '../ui/avatar'
import { BookUser, LogOut, User2, UserRoundPlus } from 'lucide-react'
import { Button } from '../ui/button'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import store from '../redux/store'
import { toast } from '@/hooks/use-toast'
import { ToastAction } from '../ui/toast'
import axios from 'axios'
import { USER_API_END_POINT } from '../utils/constant'
import { setAuthUser } from '../redux/authSlice'

const Navbar = () => {
  const { user } = useSelector(store => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await axios.get(`${USER_API_END_POINT}/logout`, {
        withCredentials: true
      })
      if (res.data.success) {
        dispatch(setAuthUser(null));
        navigate('/')
        toast({
          title: res.data.message,
          status: "success",
          action: (
            <ToastAction altText="OK">
              OK
            </ToastAction>
          ),
        });
      }
    } catch (error) {
      console.log(error);
      toast({
        title: error.response?.data?.message,
        status: "error",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    }
  }
  return (
    <div>
      <div className='flex items-center justify-between mx-auto max-w-7xl h-16'>
        <div>
          <Link to='/'><h1 className='text-2xl font-bold'>Job<span className='text-[#F83002]'>Portal</span></h1></Link>
        </div>
        <div className='flex items-center gap-5'>
          <ul className='flex font-medium gap-5 '>
            {
              user && user.role === 'recruiter' ? (
                <>
                  <li><Link to='/admin/companies'>Companies</Link></li>
                  <li><Link to='/admin/jobs'>Jobs</Link></li>
                </>
              ) : (
                <>
                  <li><Link to="/">Home</Link></li>
                  <li><Link to="/jobs">Jobs</Link></li>
                  <li><Link to="/brower">Browser</Link></li>
                </>
              )
            }

          </ul>
          {!user ? (
            <div className='gap-2 flex items-center'>
              <Link to="/login"><Button variant="outline">Login</Button></Link>
              <Link to="/signup"><Button className="bg-[#6A38C2] hover:bg-[#5a21bb]">Sign up</Button></Link>
            </div>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <Avatar className='cursor-pointer'>
                  <AvatarImage className='object-cover' src={user.profile.profilePhoto || "https://github.com/shadcn.png"} />
                </Avatar>
              </PopoverTrigger>
              <PopoverContent>
                <div>
                  <div className='flex gap-3 items-center'>
                    <Avatar className='cursor-pointer'>
                      <AvatarImage className='object-cover' src={user.profile.profilePhoto || "https://github.com/shadcn.png"} />
                    </Avatar>
                    <div>
                      <h4 className='font-medium'>{user.fullName}</h4>
                      <p className='text-sm text-muted-foreground'>{user.profile.bio}</p>
                    </div>
                  </div>

                  <div>
                    {
                      user && user.role === 'student' && (
                        <div className='flex w-fit items-center gap-2 cursor-pointer mt-2'>
                          <User2 />
                          <Button variant="link"><Link to="/profile">Xem thông tin cá nhân</Link></Button>
                        </div>
                      )
                    }
                    {
                      user && user.role !== 'student' && (
                        <>
                          <div className='flex w-fit items-center gap-2 cursor-pointer mt-2'>
                            <BookUser />
                            <Button variant="link"><Link to="/admin/listUser">Danh sách tài khoản admin</Link></Button>
                          </div>
                          <div className='flex w-fit items-center gap-2 cursor-pointer mt-2'>
                            <UserRoundPlus />
                            <Button variant="link"><Link to="/admin/createUser">Tạo mới tài khoản admin</Link></Button>
                          </div>
                        </>
                      )
                    }
                    <div className='flex w-fit items-center gap-2 cursor-pointer mt-2'>
                      <LogOut />
                      <Button variant="link" onClick={handleLogout}>Đăng xuất</Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </div>
  )
}

export default Navbar