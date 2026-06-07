import {useState, useEffect} from 'react'
import Spinner from '../../components/common/Spinner'
import progressService from '../../services/progressService.js'
import toast from 'react-hot-toast'
import { FileText, BookOpen, BrainCircuit, TrendingUp, Clock} from 'lucide-react'

const DashboardPage = () => {

  const [dashboardData, setDashboardData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await progressService.getDashboard()
        console.log("Data___getDashboard: ",data)
        setDashboardData(data.data)
      } catch (error) {
        toast.error('Failed to fetch dashboard data')
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDashboardData()
  },  [])

  if(isLoading) {
    return <Spinner/>
  }

  if (!dashboardData || !dashboardData.overview) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-slate-100 mb-4">
            <TrendingUp className='size-8 text-slate-400'/>
          </div>
          <p className="text-slate-600 text-sm ">No dashboard data available.</p>
        </div>
      </div>
    )
  }

  const stats = [
    {
      label: "Total Documents",
      value: dashboardData.overview.totalDocuments,
      icon: FileText,
      grradient: 'from-blue-400 to-cyan-500',
      shadowColor: 'shadow-blue-500/25'
    },
    {
      label: "Total Flashcards",
      value: dashboardData.overview.totalFlashcards,
      icon: BookOpen,
      grradient: 'from-purple-400 to-pink-500',
      shadowColor: 'shadow-purple-500/25'
    },
    {
      label: "Total Quizzes",
      value: dashboardData.overview.totalQuizzes,
      icon: BrainCircuit,
      grradient: 'from-emerald-400 to-teal-500',
      shadowColor: 'shadow-emerald-500/25'
    },
  ]
  return (
    <div>dashbord</div>
  )
}

export default DashboardPage