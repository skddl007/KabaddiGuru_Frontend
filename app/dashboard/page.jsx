"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Bot, TrendingUp, TrendingDown, Users, Trophy, Target, Shield, Play, Filter, RotateCcw, MapPin, Clock, Star, Award, Zap, BarChart3, User, Home, Video, Search, ChevronRight, Activity, Globe } from 'lucide-react'
import Link from "next/link"
import AuthWrapper from "@/components/AuthWrapper"

// Mock comprehensive dataset
const mockDataset = {
  matches: [
    {
      Match_Number: 1, Season: 11, Team_A_Name: "Patna Pirates", Team_B_Name: "U Mumba",
      Team_A_Code: "PAT", Team_B_Code: "MUM", Final_Team_A_Score: 34, Final_Team_B_Score: 28,
      Match_Winner_Team: "Patna Pirates", Match_City_Venue: "Mumbai", Stage: "League"
    },
    {
      Match_Number: 2, Season: 11, Team_A_Name: "Bengaluru Bulls", Team_B_Name: "Telugu Titans",
      Team_A_Code: "BLR", Team_B_Code: "TEL", Final_Team_A_Score: 31, Final_Team_B_Score: 29,
      Match_Winner_Team: "Bengaluru Bulls", Match_City_Venue: "Bengaluru", Stage: "League"
    },
    {
      Match_Number: 3, Season: 11, Team_A_Name: "Dabang Delhi", Team_B_Name: "UP Yoddha",
      Team_A_Code: "DEL", Team_B_Code: "UP", Final_Team_A_Score: 42, Final_Team_B_Score: 38,
      Match_Winner_Team: "Dabang Delhi", Match_City_Venue: "Delhi", Stage: "Playoffs"
    }
  ],
  raids: [
    {
      Unique_Raid_Identifier: "R001", Match_Number: 1, Attacking_Player_Name: "Pardeep Narwal",
      Attacking_Team_Code: "PAT", Defending_Team_Code: "MUM", Points_Scored_By_Attacker: 2,
      Points_Scored_By_Defenders: 0, Game_Half_Period: "First Half", Attack_Techniques_Used: "Hand Touch",
      Defense_Techniques_Used: "Ankle Hold", Empty_Raid_Penalty_Sequence: "No", Raid_Video_URL: "https://example.com/raid1.mp4"
    },
    {
      Unique_Raid_Identifier: "R002", Match_Number: 1, Attacking_Player_Name: "Fazel Atrachali",
      Attacking_Team_Code: "MUM", Defending_Team_Code: "PAT", Points_Scored_By_Attacker: 0,
      Points_Scored_By_Defenders: 2, Game_Half_Period: "First Half", Attack_Techniques_Used: "Toe Touch",
      Defense_Techniques_Used: "Super Tackle", Empty_Raid_Penalty_Sequence: "No", Raid_Video_URL: "https://example.com/raid2.mp4"
    },
    {
      Unique_Raid_Identifier: "R003", Match_Number: 2, Attacking_Player_Name: "Pawan Sehrawat",
      Attacking_Team_Code: "BLR", Defending_Team_Code: "TEL", Points_Scored_By_Attacker: 3,
      Points_Scored_By_Defenders: 0, Game_Half_Period: "Second Half", Attack_Techniques_Used: "Bonus Point",
      Defense_Techniques_Used: "Chain Tackle", Empty_Raid_Penalty_Sequence: "No", Raid_Video_URL: "https://example.com/raid3.mp4"
    }
  ],
  players: [
    { name: "Pardeep Narwal", team: "Patna Pirates", totalPoints: 89, raids: 45, successRate: 78, superRaids: 12, doOrDiePoints: 15 },
    { name: "Pawan Sehrawat", team: "Bengaluru Bulls", totalPoints: 82, raids: 42, successRate: 75, superRaids: 10, doOrDiePoints: 12 },
    { name: "Fazel Atrachali", team: "U Mumba", totalPoints: 34, tackles: 28, tackleSuccessRate: 68, superTackles: 8, highFives: 3 },
    { name: "Nitesh Kumar", team: "UP Yoddha", totalPoints: 31, tackles: 25, tackleSuccessRate: 72, superTackles: 6, highFives: 2 }
  ]
}

const navigationItems = [
  { id: 'overview', label: 'Dashboard Overview', icon: Home },
  { id: 'player', label: 'Player Performance', icon: User },
  { id: 'team', label: 'Team Insights', icon: Users },
  { id: 'match', label: 'Match Summary', icon: Trophy },
  { id: 'raid', label: 'Raid Analysis', icon: Activity },
  { id: 'venue', label: 'Venue Performance', icon: MapPin },
  { id: 'video', label: 'Video Highlights', icon: Video }
]

export default function InteractiveKabaddiDashboard() {
  const [activeSection, setActiveSection] = useState('overview')
  const [filters, setFilters] = useState({
    season: 'all',
    teams: [],
    player: 'all',
    matchRange: [1, 50],
    venue: 'all',
    gameHalf: 'all'
  })
  const [searchPlayer, setSearchPlayer] = useState('')

  // Calculate filtered data and KPIs
  const filteredData = useMemo(() => {
    // Apply filters to dataset
    return {
      matches: mockDataset.matches,
      raids: mockDataset.raids,
      players: mockDataset.players
    }
  }, [filters])

  const kpis = useMemo(() => {
    const totalMatches = filteredData.matches.length
    const totalRaids = filteredData.raids.length
    const successfulRaids = filteredData.raids.filter(r => r.Points_Scored_By_Attacker > 0).length
    const successfulTackles = filteredData.raids.filter(r => r.Points_Scored_By_Defenders > 0).length
    
    return {
      totalMatches,
      totalRaids,
      raidSuccessRate: totalRaids > 0 ? Math.round((successfulRaids / totalRaids) * 100) : 0,
      tackleSuccessRate: totalRaids > 0 ? Math.round((successfulTackles / totalRaids) * 100) : 0,
      topScorer: "Pardeep Narwal",
      topScorerPoints: 89,
      mostWins: "Patna Pirates",
      mostWinsCount: 8
    }
  }, [filteredData])

  const resetFilters = () => {
    setFilters({
      season: 'all',
      teams: [],
      player: 'all',
      matchRange: [1, 50],
      venue: 'all',
      gameHalf: 'all'
    })
    setSearchPlayer('')
  }

  const handleTeamToggle = (team) => {
    setFilters(prev => ({
      ...prev,
      teams: prev.teams.includes(team) 
        ? prev.teams.filter(t => t !== team)
        : [...prev.teams, team]
    }))
  }

  const renderKPICards = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-800 mb-1">Total Matches</p>
              <p className="text-3xl font-bold text-orange-900">{kpis.totalMatches}</p>
              <p className="text-xs text-orange-700 mt-1">Season 11</p>
            </div>
            <Trophy className="w-10 h-10 text-orange-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100 hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-800 mb-1">Total Raids</p>
              <p className="text-3xl font-bold text-red-900">{kpis.totalRaids}</p>
              <p className="text-xs text-red-700 mt-1">All matches</p>
            </div>
            <Target className="w-10 h-10 text-red-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100 hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-800 mb-1">Raid Success</p>
              <p className="text-3xl font-bold text-yellow-900">{kpis.raidSuccessRate}%</p>
              <p className="text-xs text-yellow-700 mt-1">Success rate</p>
            </div>
            <Zap className="w-10 h-10 text-yellow-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800 mb-1">Tackle Success</p>
              <p className="text-3xl font-bold text-green-900">{kpis.tackleSuccessRate}%</p>
              <p className="text-xs text-green-700 mt-1">Defense rate</p>
            </div>
            <Shield className="w-10 h-10 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-800 mb-1">Top Scorer</p>
              <p className="text-lg font-bold text-purple-900">{kpis.topScorer}</p>
              <p className="text-xs text-purple-700 mt-1">{kpis.topScorerPoints} points</p>
            </div>
            <Star className="w-10 h-10 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800 mb-1">Most Wins</p>
              <p className="text-lg font-bold text-blue-900">{kpis.mostWins}</p>
              <p className="text-xs text-blue-700 mt-1">{kpis.mostWinsCount} victories</p>
            </div>
            <Award className="w-10 h-10 text-blue-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  )

const renderOverview = () => (
  <div className="space-y-6">
    {renderKPICards()}
    
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Top Raiders Bar Chart */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-orange-600" />
            <span>Top Raiders Performance</span>
          </CardTitle>
          <CardDescription>Leading point scorers with detailed metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredData.players.filter(p => p.raids).slice(0, 6).map((player, index) => (
              <div key={player.name} className="space-y-2 cursor-pointer hover:bg-orange-50 p-3 rounded-lg transition-colors" 
                   onClick={() => setFilters(prev => ({ ...prev, player: player.name }))}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{player.name}</p>
                      <p className="text-sm text-gray-600">{player.team}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-600">{player.totalPoints}</p>
                    <p className="text-xs text-gray-500">{player.successRate}% success</p>
                  </div>
                </div>
                
                {/* Horizontal Bar */}
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-4 rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                      style={{ width: `${(player.totalPoints / 100) * 100}%` }}
                    >
                      <span className="text-white text-xs font-bold">{player.totalPoints}</span>
                    </div>
                  </div>
                </div>
                
                {/* Additional Metrics */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Raids: {player.raids}</span>
                  <span className="text-gray-600">Avg: {(player.totalPoints / player.raids).toFixed(1)}</span>
                  <span className="text-gray-600">Super Raids: {player.superRaids}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Raid Success Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Raid Success Distribution</CardTitle>
          <CardDescription>Overall raid outcome breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Custom Pie Chart */}
            <div className="relative w-48 h-48 mx-auto">
              <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                {/* Successful Raids - 67% */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="20"
                  strokeDasharray="167.77 83.89"
                  strokeDashoffset="0"
                  className="transition-all duration-1000"
                />
                {/* Unsuccessful Raids - 28% */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#ef4444"
                  strokeWidth="20"
                  strokeDasharray="70.37 181.29"
                  strokeDashoffset="-167.77"
                  className="transition-all duration-1000"
                />
                {/* Empty Raids - 5% */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth="20"
                  strokeDasharray="12.57 238.99"
                  strokeDashoffset="-238.14"
                  className="transition-all duration-1000"
                />
              </svg>
              
              {/* Center Text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{kpis.totalRaids}</p>
                  <p className="text-sm text-gray-600">Total Raids</p>
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="space-y-2">
              <div className="flex items-center justify-between cursor-pointer hover:bg-green-50 p-2 rounded">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Successful</span>
                </div>
                <span className="text-lg font-bold text-green-600">67%</span>
              </div>
              <div className="flex items-center justify-between cursor-pointer hover:bg-red-50 p-2 rounded">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium">Unsuccessful</span>
                </div>
                <span className="text-lg font-bold text-red-600">28%</span>
              </div>
              <div className="flex items-center justify-between cursor-pointer hover:bg-yellow-50 p-2 rounded">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium">Empty Raids</span>
                </div>
                <span className="text-lg font-bold text-yellow-600">5%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Team Performance Bar Chart */}
    <Card>
      <CardHeader>
        <CardTitle>Team Performance Comparison</CardTitle>
        <CardDescription>Win rates and average points by team</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Win Rate Chart */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Win Rate by Team</h4>
            <div className="space-y-4">
              {['Patna Pirates', 'Bengaluru Bulls', 'Dabang Delhi', 'U Mumba', 'Telugu Titans'].map((team, index) => {
                const winRate = 80 - index * 5;
                return (
                  <div key={team} className="space-y-2 cursor-pointer hover:bg-blue-50 p-3 rounded-lg transition-colors"
                       onClick={() => handleTeamToggle(team)}>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">{team}</span>
                      <span className="font-bold text-blue-600">{winRate}%</span>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-700"
                          style={{ width: `${winRate}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{Math.floor(winRate/5)} wins</span>
                      <span>{5 - Math.floor(winRate/5)} losses</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Average Points Chart */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Average Points per Match</h4>
            <div className="space-y-4">
              {['Patna Pirates', 'Bengaluru Bulls', 'Dabang Delhi', 'U Mumba', 'Telugu Titans'].map((team, index) => {
                const avgPoints = 35 - index * 2;
                return (
                  <div key={team} className="space-y-2 cursor-pointer hover:bg-green-50 p-3 rounded-lg transition-colors"
                       onClick={() => handleTeamToggle(team)}>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">{team}</span>
                      <span className="font-bold text-green-600">{avgPoints}</span>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-700"
                          style={{ width: `${(avgPoints/40) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Half-wise Performance Comparison */}
    <Card>
      <CardHeader>
        <CardTitle>First Half vs Second Half Performance</CardTitle>
        <CardDescription>Scoring patterns across game halves</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {['Patna Pirates', 'Bengaluru Bulls', 'Dabang Delhi', 'U Mumba'].map((team, index) => {
            const firstHalf = 18 + index;
            const secondHalf = 20 + index;
            return (
              <div key={team} className="p-4 border-2 border-gray-100 rounded-xl hover:border-orange-200 hover:shadow-lg cursor-pointer transition-all"
                   onClick={() => handleTeamToggle(team)}>
                <h4 className="font-semibold text-center mb-4 text-gray-900">{team}</h4>
                
                {/* Vertical Bar Chart */}
                <div className="flex items-end justify-center space-x-4 h-32 mb-4">
                  <div className="flex flex-col items-center">
                    <div 
                      className="w-8 bg-gradient-to-t from-orange-500 to-orange-300 rounded-t transition-all duration-700 flex items-end justify-center"
                      style={{ height: `${(firstHalf/25) * 100}%` }}
                    >
                      <span className="text-white text-xs font-bold mb-1">{firstHalf}</span>
                    </div>
                    <span className="text-xs text-gray-600 mt-2">1st Half</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div 
                      className="w-8 bg-gradient-to-t from-red-500 to-red-300 rounded-t transition-all duration-700 flex items-end justify-center"
                      style={{ height: `${(secondHalf/25) * 100}%` }}
                    >
                      <span className="text-white text-xs font-bold mb-1">{secondHalf}</span>
                    </div>
                    <span className="text-xs text-gray-600 mt-2">2nd Half</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total: {firstHalf + secondHalf} points</p>
                  <p className="text-xs text-gray-500">Avg per match</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  </div>
)

const renderPlayerPerformance = () => (
  <div className="space-y-6">
    {/* Enhanced Top Raiders with Horizontal Bar Chart */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-orange-600" />
          <span>Top Raiders Performance Analysis</span>
        </CardTitle>
        <CardDescription>Comprehensive raider statistics with visual comparison</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {filteredData.players.filter(p => p.raids).map((player, index) => (
            <div key={player.name} className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl hover:shadow-lg cursor-pointer transition-all"
                 onClick={() => setFilters(prev => ({ ...prev, player: player.name }))}>
              
              {/* Player Header */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{player.name}</h3>
                    <p className="text-gray-600">{player.team}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-orange-600">{player.totalPoints}</p>
                  <p className="text-sm text-gray-600">Total Points</p>
                </div>
              </div>

              {/* Performance Metrics Bar Chart */}
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="h-20 flex items-end justify-center mb-2">
                    <div 
                      className="w-8 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t flex items-end justify-center transition-all duration-700"
                      style={{ height: `${(player.raids/50) * 100}%` }}
                    >
                      <span className="text-white text-xs font-bold mb-1">{player.raids}</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-700">Raids</p>
                </div>
                
                <div className="text-center">
                  <div className="h-20 flex items-end justify-center mb-2">
                    <div 
                      className="w-8 bg-gradient-to-t from-green-500 to-green-300 rounded-t flex items-end justify-center transition-all duration-700"
                      style={{ height: `${player.successRate}%` }}
                    >
                      <span className="text-white text-xs font-bold mb-1">{player.successRate}%</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-700">Success Rate</p>
                </div>
                
                <div className="text-center">
                  <div className="h-20 flex items-end justify-center mb-2">
                    <div 
                      className="w-8 bg-gradient-to-t from-purple-500 to-purple-300 rounded-t flex items-end justify-center transition-all duration-700"
                      style={{ height: `${(player.superRaids/15) * 100}%` }}
                    >
                      <span className="text-white text-xs font-bold mb-1">{player.superRaids}</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-700">Super Raids</p>
                </div>
                
                <div className="text-center">
                  <div className="h-20 flex items-end justify-center mb-2">
                    <div 
                      className="w-8 bg-gradient-to-t from-yellow-500 to-yellow-300 rounded-t flex items-end justify-center transition-all duration-700"
                      style={{ height: `${(player.doOrDiePoints/20) * 100}%` }}
                    >
                      <span className="text-white text-xs font-bold mb-1">{player.doOrDiePoints}</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-700">Do-or-Die</p>
                </div>
              </div>

              {/* Performance Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Overall Performance</span>
                  <span className="font-bold text-orange-600">{(player.totalPoints / player.raids).toFixed(1)} pts/raid</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${(player.totalPoints / 100) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Enhanced Defenders Chart */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <span>Top Defenders Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {filteredData.players.filter(p => p.tackles).map((player, index) => (
            <div key={player.name} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:shadow-lg cursor-pointer transition-all"
                 onClick={() => setFilters(prev => ({ ...prev, player: player.name }))}>
              
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{player.name}</h3>
                    <p className="text-gray-600">{player.team}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-600">{player.totalPoints}</p>
                  <p className="text-sm text-gray-600">Tackle Points</p>
                </div>
              </div>

              {/* Defense Metrics */}
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="h-16 flex items-end justify-center mb-2">
                    <div 
                      className="w-8 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t flex items-end justify-center transition-all duration-700"
                      style={{ height: `${(player.tackles/30) * 100}%` }}
                    >
                      <span className="text-white text-xs font-bold mb-1">{player.tackles}</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-700">Tackles</p>
                </div>
                
                <div className="text-center">
                  <div className="h-16 flex items-end justify-center mb-2">
                    <div 
                      className="w-8 bg-gradient-to-t from-green-500 to-green-300 rounded-t flex items-end justify-center transition-all duration-700"
                      style={{ height: `${player.tackleSuccessRate}%` }}
                    >
                      <span className="text-white text-xs font-bold mb-1">{player.tackleSuccessRate}%</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-700">Success Rate</p>
                </div>
                
                <div className="text-center">
                  <div className="h-16 flex items-end justify-center mb-2">
                    <div 
                      className="w-8 bg-gradient-to-t from-purple-500 to-purple-300 rounded-t flex items-end justify-center transition-all duration-700"
                      style={{ height: `${(player.superTackles/10) * 100}%` }}
                    >
                      <span className="text-white text-xs font-bold mb-1">{player.superTackles}</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-700">Super Tackles</p>
                </div>
                
                <div className="text-center">
                  <div className="h-16 flex items-end justify-center mb-2">
                    <div 
                      className="w-8 bg-gradient-to-t from-yellow-500 to-yellow-300 rounded-t flex items-end justify-center transition-all duration-700"
                      style={{ height: `${(player.highFives/5) * 100}%` }}
                    >
                      <span className="text-white text-xs font-bold mb-1">{player.highFives}</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-700">High 5s</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Enhanced Player Performance Matrix */}
    <Card>
      <CardHeader>
        <CardTitle>Comprehensive Player Performance Matrix</CardTitle>
        <CardDescription>Complete statistical breakdown with visual indicators</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <th className="text-left p-4 font-bold">Player</th>
                <th className="text-left p-4 font-bold">Team</th>
                <th className="text-center p-4 font-bold">Total Points</th>
                <th className="text-center p-4 font-bold">Super Raids</th>
                <th className="text-center p-4 font-bold">Super Tackles</th>
                <th className="text-center p-4 font-bold">Do-or-Die Points</th>
                <th className="text-center p-4 font-bold">Performance</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.players.map((player, index) => (
                <tr key={player.name} className="border-b hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 cursor-pointer transition-all"
                    onClick={() => setFilters(prev => ({ ...prev, player: player.name }))}>
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <span className="font-semibold">{player.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{player.team}</td>
                  <td className="text-center p-4">
                    <div className="flex flex-col items-center">
                      <Badge className="bg-orange-100 text-orange-800 font-bold">{player.totalPoints}</Badge>
                      <div className="w-16 h-1 bg-gray-200 rounded mt-1">
                        <div 
                          className="h-1 bg-orange-500 rounded transition-all duration-500"
                          style={{ width: `${(player.totalPoints / 100) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="text-center p-4">
                    <Badge variant="outline" className="font-bold">{player.superRaids || 0}</Badge>
                  </td>
                  <td className="text-center p-4">
                    <Badge variant="outline" className="font-bold">{player.superTackles || 0}</Badge>
                  </td>
                  <td className="text-center p-4">
                    <Badge variant="outline" className="font-bold">{player.doOrDiePoints || 0}</Badge>
                  </td>
                  <td className="text-center p-4">
                    <div className="flex items-center justify-center">
                      {player.raids ? (
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < Math.floor(player.successRate / 20) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Shield 
                              key={i} 
                              className={`w-4 h-4 ${i < Math.floor(player.tackleSuccessRate / 20) ? 'text-blue-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
)

  const renderTeamInsights = () => (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Win Rates by Team */}
        <Card>
          <CardHeader>
            <CardTitle>Win Rates by Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['Patna Pirates', 'Bengaluru Bulls', 'Dabang Delhi', 'U Mumba'].map((team, index) => (
                <div key={team} className="space-y-2 cursor-pointer hover:bg-gray-50 p-3 rounded-lg"
                     onClick={() => handleTeamToggle(team)}>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{team}</span>
                    <span className="font-bold text-green-600">{80 - index * 5}%</span>
                  </div>
                  <Progress value={80 - index * 5} className="h-3" />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{12 - index} wins</span>
                    <span>{3 + index} losses</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Raid Success Rate Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Raid Success Rate Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['Patna Pirates', 'Bengaluru Bulls', 'Dabang Delhi', 'U Mumba'].map((team, index) => (
                <div key={team} className="space-y-2 cursor-pointer hover:bg-gray-50 p-3 rounded-lg"
                     onClick={() => handleTeamToggle(team)}>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{team}</span>
                    <span className="font-bold text-blue-600">{75 - index * 2}%</span>
                  </div>
                  <Progress value={75 - index * 2} className="h-3" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* First Half vs Second Half Scoring */}
      <Card>
        <CardHeader>
          <CardTitle>First Half vs Second Half Scoring Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['Patna Pirates', 'Bengaluru Bulls', 'Dabang Delhi', 'U Mumba'].map((team, index) => (
              <div key={team} className="p-4 border rounded-lg hover:shadow-md cursor-pointer transition-shadow"
                   onClick={() => handleTeamToggle(team)}>
                <h4 className="font-semibold text-center mb-3">{team}</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-orange-600">First Half</span>
                    <span className="font-bold text-orange-600">{18 + index}</span>
                  </div>
                  <Progress value={(18 + index) * 2} className="h-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-red-600">Second Half</span>
                    <span className="font-bold text-red-600">{20 + index}</span>
                  </div>
                  <Progress value={(20 + index) * 2} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderMatchSummary = () => (
    <Card>
      <CardHeader>
        <CardTitle>Match Summary</CardTitle>
        <CardDescription>Complete match results and statistics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3 font-semibold">Match #</th>
                <th className="text-left p-3 font-semibold">Team A</th>
                <th className="text-left p-3 font-semibold">Team B</th>
                <th className="text-center p-3 font-semibold">Final Score</th>
                <th className="text-left p-3 font-semibold">Winner</th>
                <th className="text-left p-3 font-semibold">Venue</th>
                <th className="text-left p-3 font-semibold">Stage</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.matches.map((match) => (
                <tr key={match.Match_Number} className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => setFilters(prev => ({ ...prev, matchRange: [match.Match_Number, match.Match_Number] }))}>
                  <td className="p-3 font-medium">#{match.Match_Number}</td>
                  <td className="p-3">{match.Team_A_Name}</td>
                  <td className="p-3">{match.Team_B_Name}</td>
                  <td className="text-center p-3">
                    <Badge variant="outline" className="font-mono">
                      {match.Final_Team_A_Score}-{match.Final_Team_B_Score}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Badge className="bg-green-100 text-green-800">
                      {match.Match_Winner_Team}
                    </Badge>
                  </td>
                  <td className="p-3 text-gray-600">{match.Match_City_Venue}</td>
                  <td className="p-3">
                    <Badge variant="secondary">{match.Stage}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )

const renderRaidAnalysis = () => (
  <div className="space-y-6">
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Enhanced Raid Outcomes Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Raid Outcomes Distribution</CardTitle>
          <CardDescription>Complete breakdown of all raid attempts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Large Pie Chart */}
            <div className="relative w-64 h-64 mx-auto">
              <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 100 100">
                {/* Successful Raids - 67% */}
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="30"
                  strokeDasharray="147.65 73.83"
                  strokeDashoffset="0"
                  className="transition-all duration-1000 hover:stroke-width-32"
                />
                {/* Unsuccessful Raids - 28% */}
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  fill="transparent"
                  stroke="#ef4444"
                  strokeWidth="30"
                  strokeDasharray="61.58 159.9"
                  strokeDashoffset="-147.65"
                  className="transition-all duration-1000 hover:stroke-width-32"
                />
                {/* Empty Raids - 5% */}
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth="30"
                  strokeDasharray="11.0 210.48"
                  strokeDashoffset="-209.23"
                  className="transition-all duration-1000 hover:stroke-width-32"
                />
              </svg>
              
              {/* Center Statistics */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center bg-white rounded-full w-20 h-20 flex items-center justify-center shadow-lg">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{kpis.totalRaids}</p>
                    <p className="text-xs text-gray-600">Raids</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Legend with Statistics */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <div>
                    <span className="font-semibold text-green-800">Successful Raids</span>
                    <p className="text-xs text-green-600">Points scored by attacker</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-green-600">67%</span>
                  <p className="text-xs text-green-600">134 raids</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✗</span>
                  </div>
                  <div>
                    <span className="font-semibold text-red-800">Unsuccessful Raids</span>
                    <p className="text-xs text-red-600">Tackled by defenders</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-red-600">28%</span>
                  <p className="text-xs text-red-600">56 raids</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">∅</span>
                  </div>
                  <div>
                    <span className="font-semibold text-yellow-800">Empty Raids</span>
                    <p className="text-xs text-yellow-600">No touch, penalty</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-yellow-600">5%</span>
                  <p className="text-xs text-yellow-600">10 raids</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attack Techniques Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Attack Techniques Analysis</CardTitle>
          <CardDescription>Frequency and effectiveness of attack methods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { technique: 'Hand Touch', usage: 45, effectiveness: 72, color: 'from-orange-500 to-orange-300' },
              { technique: 'Toe Touch', usage: 32, effectiveness: 68, color: 'from-red-500 to-red-300' },
              { technique: 'Bonus Point', usage: 28, effectiveness: 85, color: 'from-blue-500 to-blue-300' },
              { technique: 'Running Hand Touch', usage: 25, effectiveness: 65, color: 'from-green-500 to-green-300' },
              { technique: 'Dubki', usage: 18, effectiveness: 58, color: 'from-purple-500 to-purple-300' }
            ].map((item, index) => (
              <div key={item.technique} className="space-y-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">{item.technique}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">{item.usage}% usage</span>
                    <span className="text-sm font-bold text-blue-600">{item.effectiveness}% effective</span>
                  </div>
                </div>
                
                {/* Usage Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Usage Frequency</span>
                    <span>{item.usage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`bg-gradient-to-r ${item.color} h-2 rounded-full transition-all duration-700`}
                      style={{ width: `${item.usage}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Effectiveness Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Success Rate</span>
                    <span>{item.effectiveness}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-300 h-2 rounded-full transition-all duration-700"
                      style={{ width: `${item.effectiveness}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Defense Techniques Analysis */}
    <Card>
      <CardHeader>
        <CardTitle>Defense Techniques Effectiveness</CardTitle>
        <CardDescription>Defensive strategies and their success rates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { technique: 'Ankle Hold', usage: 38, effectiveness: 65, color: 'from-blue-500 to-blue-300' },
            { technique: 'Super Tackle', usage: 28, effectiveness: 82, color: 'from-green-500 to-green-300' },
            { technique: 'Chain Tackle', usage: 32, effectiveness: 58, color: 'from-purple-500 to-purple-300' },
            { technique: 'Thigh Hold', usage: 25, effectiveness: 62, color: 'from-red-500 to-red-300' }
          ].map((item, index) => (
            <div key={item.technique} className="p-4 border-2 border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-lg cursor-pointer transition-all">
              <div className="text-center mb-4">
                <h4 className="font-bold text-lg text-gray-900">{item.technique}</h4>
                <p className="text-sm text-gray-600">Defensive technique analysis</p>
              </div>
              
              {/* Vertical Bar Chart */}
              <div className="flex justify-center items-end space-x-6 h-32 mb-4">
                <div className="flex flex-col items-center">
                  <div 
                    className={`w-12 bg-gradient-to-t ${item.color} rounded-t flex items-end justify-center transition-all duration-700`}
                    style={{ height: `${(item.usage/50) * 100}%` }}
                  >
                    <span className="text-white text-xs font-bold mb-1">{item.usage}%</span>
                  </div>
                  <span className="text-xs text-gray-600 mt-2">Usage</span>
                </div>
                <div className="flex flex-col items-center">
                  <div 
                    className="w-12 bg-gradient-to-t from-green-500 to-green-300 rounded-t flex items-end justify-center transition-all duration-700"
                    style={{ height: `${(item.effectiveness/100) * 100}%` }}
                  >
                    <span className="text-white text-xs font-bold mb-1">{item.effectiveness}%</span>
                  </div>
                  <span className="text-xs text-gray-600 mt-2">Success</span>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">Overall Rating</p>
                <div className="flex justify-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < Math.floor((item.usage + item.effectiveness) / 40) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Empty Raid Frequency Chart */}
    <Card>
      <CardHeader>
        <CardTitle>Empty Raid Analysis by Team</CardTitle>
        <CardDescription>Teams with lowest empty raid penalties</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {['Patna Pirates', 'Bengaluru Bulls', 'Dabang Delhi', 'U Mumba', 'Telugu Titans'].map((team, index) => {
            const emptyRaids = 3 + index;
            const totalRaids = 40 + index * 2;
            const percentage = ((emptyRaids / totalRaids) * 100).toFixed(1);
            
            return (
              <div key={team} className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg hover:shadow-md cursor-pointer transition-all"
                   onClick={() => handleTeamToggle(team)}>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{team}</h4>
                    <p className="text-sm text-gray-600">{totalRaids} total raids</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-yellow-600">{emptyRaids}</p>
                    <p className="text-sm text-gray-600">{percentage}% empty</p>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all duration-700"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-600 mt-2">
                  <span>Successful: {totalRaids - emptyRaids}</span>
                  <span>Empty: {emptyRaids}</span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  </div>
)

  const renderVenuePerformance = () => (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Venue Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-purple-600" />
              <span>Venue Performance Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['Mumbai', 'Bengaluru', 'Delhi', 'Patna', 'Hyderabad'].map((venue, index) => (
                <div key={venue} className="flex justify-between items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 cursor-pointer transition-colors"
                     onClick={() => setFilters(prev => ({ ...prev, venue }))}>
                  <div>
                    <p className="font-medium text-gray-900">{venue}</p>
                    <p className="text-sm text-gray-600">{12 - index * 2} matches played</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-purple-600">{75 - index * 3}%</p>
                    <p className="text-xs text-gray-500">Home win rate</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Average Points by Venue */}
        <Card>
          <CardHeader>
            <CardTitle>Average Points by Venue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['Mumbai', 'Bengaluru', 'Delhi', 'Patna', 'Hyderabad'].map((venue, index) => (
                <div key={venue} className="space-y-2 cursor-pointer hover:bg-gray-50 p-3 rounded-lg"
                     onClick={() => setFilters(prev => ({ ...prev, venue }))}>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{venue}</span>
                    <span className="font-bold text-indigo-600">{32 + index * 2} pts</span>
                  </div>
                  <Progress value={(32 + index * 2)} className="h-3" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderVideoHighlights = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Play className="w-5 h-5 text-red-600" />
          <span>Video Highlights & Raid Details</span>
        </CardTitle>
        <CardDescription>Click on video links to watch raid highlights</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3 font-semibold">Raid #</th>
                <th className="text-left p-3 font-semibold">Match</th>
                <th className="text-left p-3 font-semibold">Player</th>
                <th className="text-center p-3 font-semibold">Points</th>
                <th className="text-left p-3 font-semibold">Technique</th>
                <th className="text-left p-3 font-semibold">Half</th>
                <th className="text-center p-3 font-semibold">Video</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.raids.map((raid, index) => (
                <tr key={raid.Unique_Raid_Identifier} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">#{index + 1}</td>
                  <td className="p-3">
                    <Badge variant="outline">M{raid.Match_Number}</Badge>
                  </td>
                  <td className="p-3">
                    <div className="cursor-pointer hover:text-blue-600"
                         onClick={() => setFilters(prev => ({ ...prev, player: raid.Attacking_Player_Name }))}>
                      <p className="font-medium">{raid.Attacking_Player_Name}</p>
                      <p className="text-xs text-gray-600">{raid.Attacking_Team_Code}</p>
                    </div>
                  </td>
                  <td className="text-center p-3">
                    <Badge 
                      className={
                        raid.Points_Scored_By_Attacker > 0 
                          ? "bg-green-100 text-green-800" 
                          : raid.Points_Scored_By_Defenders > 0
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                      }
                    >
                      {raid.Points_Scored_By_Attacker > 0 
                        ? `+${raid.Points_Scored_By_Attacker}` 
                        : raid.Points_Scored_By_Defenders > 0 
                          ? `D+${raid.Points_Scored_By_Defenders}` 
                          : "0"
                      }
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Badge variant="outline" className="text-xs">
                      {raid.Attack_Techniques_Used}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Badge variant="secondary" className="text-xs cursor-pointer"
                           onClick={() => setFilters(prev => ({ ...prev, gameHalf: raid.Game_Half_Period }))}>
                      {raid.Game_Half_Period}
                    </Badge>
                  </td>
                  <td className="text-center p-3">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => window.open(raid.Raid_Video_URL, '_blank')}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Watch
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )

  const renderMainContent = () => {
    switch (activeSection) {
      case 'overview': return renderOverview()
      case 'player': return renderPlayerPerformance()
      case 'team': return renderTeamInsights()
      case 'match': return renderMatchSummary()
      case 'raid': return renderRaidAnalysis()
      case 'venue': return renderVenuePerformance()
      case 'video': return renderVideoHighlights()
      default: return renderOverview()
    }
  }

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      {/* Fixed Filter Panel */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    Pro Kabaddi Season 11
                  </h1>
                  <p className="text-sm text-gray-600">Interactive Analytics Dashboard</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-800">Live Data</Badge>
              <Badge variant="outline">Season 11</Badge>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Season</Label>
              <Select value={filters.season} onValueChange={(value) => setFilters(prev => ({ ...prev, season: value }))}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Seasons</SelectItem>
                  <SelectItem value="11">Season 11</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">Teams</Label>
              <div className="relative">
                <Button variant="outline" className="w-full h-8 justify-start text-left font-normal">
                  {filters.teams.length > 0 ? `${filters.teams.length} selected` : 'All Teams'}
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">Player</Label>
              <div className="relative">
                <Input
                  placeholder="Search player..."
                  value={searchPlayer}
                  onChange={(e) => setSearchPlayer(e.target.value)}
                  className="h-8"
                />
                <Search className="absolute right-2 top-2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">Venue/Stage</Label>
              <Select value={filters.venue} onValueChange={(value) => setFilters(prev => ({ ...prev, venue: value }))}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Venues</SelectItem>
                  <SelectItem value="League">League</SelectItem>
                  <SelectItem value="Playoffs">Playoffs</SelectItem>
                  <SelectItem value="Final">Final</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">Game Half</Label>
              <Select value={filters.gameHalf} onValueChange={(value) => setFilters(prev => ({ ...prev, gameHalf: value }))}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Both Halves</SelectItem>
                  <SelectItem value="First Half">First Half</SelectItem>
                  <SelectItem value="Second Half">Second Half</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">Match Range: {filters.matchRange[0]}-{filters.matchRange[1]}</Label>
              <Slider
                value={filters.matchRange}
                onValueChange={(value) => setFilters(prev => ({ ...prev, matchRange: value }))}
                max={50}
                min={1}
                step={1}
                className="w-full"
              />
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={resetFilters}
                className="w-full h-8"
                size="sm"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left Navigation Sidebar */}
        <div className="w-64 bg-white border-r shadow-sm h-screen sticky top-[120px] overflow-y-auto">
          <div className="p-4">
            <h2 className="font-semibold text-gray-900 mb-4">Navigation</h2>
            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === item.id
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    {activeSection === item.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Main Content Panel */}
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {renderMainContent()}
          </div>
        </div>
      </div>
    </div>
    </AuthWrapper>
  )
}
