"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Users, Search, Loader2, AlertCircle, CheckCircle, ArrowLeft, TrendingUp, Target, Award } from 'lucide-react'
import { toast } from "@/hooks/use-toast"
import Link from "next/link"
import AuthWrapper from "@/components/AuthWrapper"
import ChatLimitBanner from "@/components/ChatLimitBanner"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Team code to full name mapping
const TEAM_NAMES = {
  'TT': 'Telugu Titans',
  'BB': 'Bengaluru Bulls',
  'BW': 'Bengal Warriors',
  'DD': 'Dabang Delhi',
  'GG': 'Gujarat Giants',
  'HS': 'Haryana Steelers',
  'JP': 'Jaipur Pink Panthers',
  'PP': 'Patna Pirates',
  'PU': 'Puneri Paltan',
  'TN': 'Tamil Thalaivas',
  'UM': 'U Mumba',
  'UP': 'U.P. Yoddhas'
}

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("match")
  const [isLoading, setIsLoading] = useState(false)
  const [summaryData, setSummaryData] = useState(null)
  const [error, setError] = useState(null)

  // Match-wise summary state
  const [teams, setTeams] = useState([])
  const [selectedTeam1, setSelectedTeam1] = useState("")
  const [selectedTeam2, setSelectedTeam2] = useState("")
  const [matches, setMatches] = useState([])
  const [selectedMatch, setSelectedMatch] = useState("")

  // Player-wise summary state
  const [players, setPlayers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [suggestedPlayers, setSuggestedPlayers] = useState([])
  const [selectedPlayer, setSelectedPlayer] = useState("")
  const [matchFilter, setMatchFilter] = useState("all")

  // Load teams on component mount
  useEffect(() => {
    loadTeams()
  }, [])

  const loadTeams = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/teams`)
      const data = await response.json()
      if (data.success) {
        setTeams(data.teams)
      }
    } catch (error) {
      console.error('Error loading teams:', error)
      toast({
        title: "Error",
        description: "Failed to load teams",
        variant: "destructive"
      })
    }
  }

  const loadMatches = async () => {
    if (!selectedTeam1 || !selectedTeam2) return

    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE_URL}/analytics/matches/${encodeURIComponent(selectedTeam1)}/${encodeURIComponent(selectedTeam2)}`)
      const data = await response.json()
      if (data.success) {
        setMatches(data.matches)
      }
    } catch (error) {
      console.error('Error loading matches:', error)
      toast({
        title: "Error",
        description: "Failed to load matches",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const searchPlayers = async (term) => {
    if (!term || term.length < 2) {
      setSuggestedPlayers([])
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/analytics/players/search?search_term=${encodeURIComponent(term)}`)
      const data = await response.json()
      if (data.success) {
        setSuggestedPlayers(data.players)
      }
    } catch (error) {
      console.error('Error searching players:', error)
    }
  }

  const generateMatchSummary = async () => {
    if (!selectedTeam1 || !selectedTeam2 || !selectedMatch) {
      toast({
        title: "Error",
        description: "Please select both teams and a match",
        variant: "destructive"
      })
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      setSummaryData(null)

      const response = await fetch(`${API_BASE_URL}/analytics/match-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          team1: selectedTeam1,
          team2: selectedTeam2,
          match_number: parseInt(selectedMatch)
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setSummaryData(data.summary)
        toast({
          title: "Success",
          description: "Match summary generated successfully",
        })
      } else {
        setError(data.error || "Failed to generate match summary")
        toast({
          title: "Error",
          description: data.error || "Failed to generate match summary",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error generating match summary:', error)
      setError("Failed to generate match summary")
      toast({
        title: "Error",
        description: "Failed to generate match summary",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generatePlayerSummary = async () => {
    if (!selectedPlayer) {
      toast({
        title: "Error",
        description: "Please select a player",
        variant: "destructive"
      })
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      setSummaryData(null)

      // Generate comprehensive player summary (includes LLM summary)
      const response = await fetch(`${API_BASE_URL}/analytics/player-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          player_name: selectedPlayer,
          match_filter: matchFilter
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setSummaryData(data.summary)
        toast({
          title: "Success",
          description: "Player summary with performance analysis generated successfully",
        })
      } else {
        setError(data.error || "Failed to generate player summary")
        toast({
          title: "Error",
          description: data.error || "Failed to generate player summary",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error generating player summary:', error)
      setError("Failed to generate player summary")
      toast({
        title: "Error",
        description: "Failed to generate player summary",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }



  const handleTeam1Change = (value) => {
    setSelectedTeam1(value)
    setSelectedMatch("")
    setMatches([])
  }

  const handleTeam2Change = (value) => {
    setSelectedTeam2(value)
    setSelectedMatch("")
    setMatches([])
  }

  const handleSearchChange = (value) => {
    setSearchTerm(value)
    searchPlayers(value)
  }

  return (
    <AuthWrapper>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive match and player analysis with detailed insights</p>
        </div>

                {/* Chat Limit Banner */}
        <ChatLimitBanner variant="compact" />
        
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/chat">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Chat
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">KabaddiGuru Analytics Tool</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <TrendingUp className="w-3 h-3 mr-1" />
                Advanced Analytics
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Panel - Controls - Fixed */}
          <div className="w-full lg:w-80 lg:flex-shrink-0">
            <Card className="lg:sticky lg:top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Analysis Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="match">Match Analysis</TabsTrigger>
                    <TabsTrigger value="player">Player Analysis</TabsTrigger>
                  </TabsList>

                  <TabsContent value="match" className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="team1">Team A</Label>
                      <Select value={selectedTeam1} onValueChange={handleTeam1Change}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Team A" />
                        </SelectTrigger>
                        <SelectContent>
                          {teams.map((team) => (
                            <SelectItem key={team} value={team}>
                              {TEAM_NAMES[team] || team}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="team2">Team B</Label>
                      <Select value={selectedTeam2} onValueChange={handleTeam2Change}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Team B" />
                        </SelectTrigger>
                        <SelectContent>
                          {teams.map((team) => (
                            <SelectItem key={team} value={team}>
                              {TEAM_NAMES[team] || team}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedTeam1 && selectedTeam2 && (
                      <Button 
                        onClick={loadMatches} 
                        disabled={isLoading}
                        className="w-full"
                        variant="outline"
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Load Matches"}
                      </Button>
                    )}

                    {matches.length > 0 && (
                      <div>
                        <Label htmlFor="match">Select Match</Label>
                        <Select value={selectedMatch} onValueChange={setSelectedMatch}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Match" />
                          </SelectTrigger>
                          <SelectContent>
                            {matches.map((match) => (
                              <SelectItem key={match.Match_Number} value={match.Match_Number.toString()}>
                                Match {match.Match_Number} - {match.Season} - {match.Venue}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {selectedMatch && (
                      <Button 
                        onClick={generateMatchSummary} 
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate Match Summary"}
                      </Button>
                    )}
                  </TabsContent>

                  <TabsContent value="player" className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="player-search">Search Player</Label>
                      <div className="relative">
                        <Input
                          id="player-search"
                          placeholder="Type player name..."
                          value={searchTerm}
                          onChange={(e) => handleSearchChange(e.target.value)}
                        />
                        <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                      
                      {suggestedPlayers.length > 0 && (
                        <div className="mt-2 border rounded-md p-2 max-h-40 overflow-y-auto">
                          {suggestedPlayers.map((player) => (
                            <div
                              key={player}
                              className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                              onClick={() => {
                                setSelectedPlayer(player)
                                setSearchTerm(player)
                                setSuggestedPlayers([])
                              }}
                            >
                              {player}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {selectedPlayer && (
                      <div className="space-y-4">
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <Label className="text-sm text-blue-600 font-medium">Selected Player</Label>
                          <div className="text-lg font-semibold text-gray-900 mt-1">{selectedPlayer}</div>
                        </div>
                        
                        <div>
                          <Label htmlFor="match-filter">Match Filter</Label>
                          <Select value={matchFilter} onValueChange={setMatchFilter}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Matches</SelectItem>
                              <SelectItem value="last_5_matches">Last 5 Matches</SelectItem>
                              <SelectItem value="last_10_matches">Last 10 Matches</SelectItem>
                              <SelectItem value="first_5_matches">First 5 Matches</SelectItem>
                              <SelectItem value="first_10_matches">First 10 Matches</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {selectedPlayer && (
                      <Button 
                        onClick={generatePlayerSummary} 
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-green-600 to-purple-600 hover:from-green-700 hover:to-purple-700"
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate Player Summary"}
                      </Button>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

                     {/* Right Panel - Results - Vertically Scrollable */}
           <div className="lg:flex-1 min-w-0">
            {error && (
              <Card className="mb-6 border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {summaryData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <Award className="h-5 w-5 text-blue-600" />
                    Analysis Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6 max-h-[70vh] overflow-y-auto">
                     {/* Match Overview - Moved to top */}
                     {summaryData.match_id && (
                       <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                         <h3 className="text-lg font-semibold text-gray-900 mb-3">Match Overview</h3>
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                           <div>
                             <span className="text-sm text-gray-600">Match ID</span>
                             <div className="font-medium">{summaryData.match_id}</div>
                           </div>
                           <div>
                             <span className="text-sm text-gray-600">Season</span>
                             <div className="font-medium">{summaryData.season}</div>
                           </div>
                           <div>
                             <span className="text-sm text-gray-600">Venue</span>
                             <div className="font-medium">{summaryData.venue}</div>
                           </div>
                           <div>
                             <span className="text-sm text-gray-600">Winner</span>
                             <div className="font-medium text-green-600">{TEAM_NAMES[summaryData.score?.winner] || summaryData.score?.winner}</div>
                           </div>
                         </div>

                         <div className="mt-4 flex items-center justify-center space-x-8">
                           <div className="text-center">
                             <div className="text-2xl font-bold text-blue-600">{TEAM_NAMES[summaryData.teams?.team1] || summaryData.teams?.team1}</div>
                             <div className="text-3xl font-bold">{summaryData.score?.team1}</div>
                           </div>
                           <div className="text-gray-400 text-xl">vs</div>
                           <div className="text-center">
                             <div className="text-2xl font-bold text-red-600">{TEAM_NAMES[summaryData.teams?.team2] || summaryData.teams?.team2}</div>
                             <div className="text-3xl font-bold">{summaryData.score?.team2}</div>
                           </div>
                         </div>

                       </div>
                     )}

                     {/* AI-Generated Match Summary */}
                     {summaryData.tactical_analysis && (
                       <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-lg border border-purple-200">
                         <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                           <span className="text-purple-600">🤖</span>
                           AI Match Analysis
                         </h3>
                         <div className="bg-white p-4 rounded-lg border prose prose-sm max-w-none">
                           <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                             {summaryData.tactical_analysis}
                           </div>
                         </div>
                       </div>
                     )}

                     {/* AI-Generated Player Performance Summary */}
                     {summaryData.llm_summary && (
                       <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border border-indigo-200">
                         <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                           <span className="text-indigo-600">📊</span>
                           AI-Generated Player Performance Analysis
                         </h3>
                         <div className="mb-4 p-3 bg-indigo-100 rounded-lg">
                           <div className="text-sm text-indigo-800">
                             <strong>Player:</strong> {summaryData.player} | 
                             <strong>Season:</strong> {summaryData.season} | 
                             <strong>Matches Analyzed:</strong> {summaryData.matches ? summaryData.matches.length : 0}
                           </div>
                         </div>
                         <div className="bg-white p-4 rounded-lg border prose prose-sm max-w-none">
                           <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                             {summaryData.llm_summary}
                           </div>
                         </div>
                       </div>
                     )}

                                         {/* Video Content */}
                     {summaryData.super_tackle_videos && summaryData.super_tackle_videos.length > 0 && (
                       <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-lg border border-red-200">
                         <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                           <span className="text-red-600">⚡</span>
                           Super Tackle Videos ({summaryData.super_tackle_videos.length})
                         </h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                           {summaryData.super_tackle_videos.slice(0, 2).map((video, index) => (
                             <div key={index} className="bg-white p-3 rounded-lg border hover:shadow-md transition-shadow">
                               <div className="flex items-center justify-between mb-2">
                                 <span className="text-sm font-medium text-gray-900">Raid {video.raid_no}</span>
                                 <span className="text-xs text-gray-500">{video.timestamp}</span>
                               </div>
                               <div className="text-sm text-gray-700 mb-2">{video.player}</div>
                               <div className="text-xs text-gray-600 mb-3">{video.description}</div>
                               <a
                                 href={video.video_url}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors"
                               >
                                 <span>▶️</span>
                                 Watch Super Tackle
                               </a>
                             </div>
                           ))}
                           {summaryData.super_tackle_videos.length > 2 && (
                             <div className="col-span-full">
                               <details className="group">
                                 <summary className="cursor-pointer text-sm font-medium text-red-600 hover:text-red-700 text-center py-2">
                                   <span className="group-open:hidden">📺 Show {summaryData.super_tackle_videos.length - 2} More Super Tackle Videos</span>
                                   <span className="hidden group-open:inline">📺 Hide Additional Videos</span>
                                 </summary>
                                 <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                                   {summaryData.super_tackle_videos.slice(2).map((video, index) => (
                                     <div key={index + 2} className="bg-white p-3 rounded-lg border hover:shadow-md transition-shadow">
                                       <div className="flex items-center justify-between mb-2">
                                         <span className="text-sm font-medium text-gray-900">Raid {video.raid_no}</span>
                                         <span className="text-xs text-gray-500">{video.timestamp}</span>
                                       </div>
                                       <div className="text-sm text-gray-700 mb-2">{video.player}</div>
                                       <div className="text-xs text-gray-600 mb-3">{video.description}</div>
                                       <a
                                         href={video.video_url}
                                         target="_blank"
                                         rel="noopener noreferrer"
                                         className="inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors"
                                       >
                                         <span>▶️</span>
                                         Watch Super Tackle
                                       </a>
                                     </div>
                                   ))}
                                 </div>
                               </details>
                             </div>
                           )}
                         </div>
                       </div>
                     )}

                     {summaryData.bonus_point_videos && summaryData.bonus_point_videos.length > 0 && (
                       <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                         <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                           <span className="text-green-600">🎯</span>
                           Bonus Point Videos ({summaryData.bonus_point_videos.length})
                         </h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                           {summaryData.bonus_point_videos.slice(0, 2).map((video, index) => (
                             <div key={index} className="bg-white p-3 rounded-lg border hover:shadow-md transition-shadow">
                               <div className="flex items-center justify-between mb-2">
                                 <span className="text-sm font-medium text-gray-900">Raid {video.raid_no}</span>
                                 <span className="text-xs text-gray-500">{video.timestamp}</span>
                               </div>
                               <div className="text-sm text-gray-700 mb-2">{video.player}</div>
                               <div className="text-xs text-gray-600 mb-3">{video.description}</div>
                               <a
                                 href={video.video_url}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="inline-flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md transition-colors"
                               >
                                 <span>▶️</span>
                                 Watch Bonus Point
                               </a>
                             </div>
                           ))}
                           {summaryData.bonus_point_videos.length > 2 && (
                             <div className="col-span-full">
                               <details className="group">
                                 <summary className="cursor-pointer text-sm font-medium text-green-600 hover:text-green-700 text-center py-2">
                                   <span className="group-open:hidden">📺 Show {summaryData.bonus_point_videos.length - 2} More Bonus Point Videos</span>
                                   <span className="hidden group-open:inline">📺 Hide Additional Videos</span>
                                 </summary>
                                 <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                                   {summaryData.bonus_point_videos.slice(2).map((video, index) => (
                                     <div key={index + 2} className="bg-white p-3 rounded-lg border hover:shadow-md transition-shadow">
                                       <div className="flex items-center justify-between mb-2">
                                         <span className="text-sm font-medium text-gray-900">Raid {video.raid_no}</span>
                                         <span className="text-xs text-gray-500">{video.timestamp}</span>
                                       </div>
                                       <div className="text-sm text-gray-700 mb-2">{video.player}</div>
                                       <div className="text-xs text-gray-600 mb-3">{video.description}</div>
                                       <a
                                         href={video.video_url}
                                         target="_blank"
                                         rel="noopener noreferrer"
                                         className="inline-flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md transition-colors"
                                       >
                                         <span>▶️</span>
                                         Watch Bonus Point
                                       </a>
                                     </div>
                                   ))}
                                 </div>
                               </details>
                             </div>
                           )}
                         </div>
                       </div>
                     )}



                    

                    {/* Match Highlights */}
                    {summaryData.match_highlights && summaryData.match_highlights.length > 0 && (
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <span className="text-yellow-600">⭐</span>
                          Match Highlights
                        </h3>
                        <ul className="space-y-2">
                          {summaryData.match_highlights.map((highlight, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-yellow-600 mt-1">•</span>
                              <span className="text-sm text-gray-700">{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Top Performers */}
                    {(summaryData.top_raiders || summaryData.top_defenders) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {summaryData.top_raiders && summaryData.top_raiders.length > 0 && (
                          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <span className="text-blue-600">🏃</span>
                              Top Raiders
                            </h3>
                            <div className="space-y-2">
                              {summaryData.top_raiders.slice(0, 3).map((raider, index) => (
                                <div key={index} className="bg-white p-2 rounded border">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-900">{raider.name}</span>
                                    <span className="text-sm font-bold text-blue-600">{raider.raid_points} pts</span>
                                  </div>
                                  <div className="text-xs text-gray-500">Success Rate: {raider.raid_success_rate}%</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {summaryData.top_defenders && summaryData.top_defenders.length > 0 && (
                          <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-lg border border-red-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <span className="text-red-600">🛡️</span>
                              Top Defenders
                            </h3>
                            <div className="space-y-2">
                              {summaryData.top_defenders.slice(0, 3).map((defender, index) => (
                                <div key={index} className="bg-white p-2 rounded border">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-900">{defender.name}</span>
                                    <span className="text-sm font-bold text-red-600">{defender.tackle_points} pts</span>
                                  </div>
                                  <div className="text-xs text-gray-500">Success Rate: {defender.tackle_success_rate}%</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Player Match-by-Match Statistics */}
                    {summaryData.matches && summaryData.matches.length > 0 && (
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <span className="text-blue-600">🏆</span>
                          Player Match-by-Match Performance
                        </h3>
                        <div className="space-y-3">
                          {summaryData.matches.map((match, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg border">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold text-gray-900">Match {match.match_number}</h4>
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    match.result.status === 'Win' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {match.result.status}
                                  </span>
                                  <span className="text-sm text-gray-600">vs {match.opponent_team}</span>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="text-center">
                                  <div className="text-lg font-bold text-blue-600">{match.raid_stats.raid_points}</div>
                                  <div className="text-xs text-gray-600">Raid Points</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold text-green-600">{match.raid_stats.successful_raids}/{match.raid_stats.total_raids}</div>
                                  <div className="text-xs text-gray-600">Successful Raids</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold text-red-600">{match.tackle_stats.tackle_points}</div>
                                  <div className="text-xs text-gray-600">Tackle Points</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold text-purple-600">{match.tackle_stats.successful_tackles}/{match.tackle_stats.total_tackles}</div>
                                  <div className="text-xs text-gray-600">Successful Tackles</div>
                                </div>
                              </div>
                              
                              {match.achievements.milestones.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {match.achievements.milestones.map((milestone, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                                      {milestone}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Match Statistics */}
                    {summaryData.summary && (
                      <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-lg border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <span className="text-gray-600">📊</span>
                          Match Statistics
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-white p-3 rounded border text-center">
                            <div className="text-2xl font-bold text-blue-600">{summaryData.summary.total_raids}</div>
                            <div className="text-xs text-gray-600">Total Raids</div>
                          </div>
                          <div className="bg-white p-3 rounded border text-center">
                            <div className="text-2xl font-bold text-green-600">{summaryData.summary.raid_success_rate}%</div>
                            <div className="text-xs text-gray-600">Raid Success</div>
                          </div>
                          <div className="bg-white p-3 rounded border text-center">
                            <div className="text-2xl font-bold text-red-600">{summaryData.summary.super_tackles}</div>
                            <div className="text-xs text-gray-600">Super Tackles</div>
                          </div>
                          <div className="bg-white p-3 rounded border text-center">
                            <div className="text-2xl font-bold text-purple-600">{summaryData.summary.tackle_success_rate}%</div>
                            <div className="text-xs text-gray-600">Tackle Success</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Raw JSON Data (Collapsible) */}
                     <div className="border-t pt-4">
                       <details className="group">
                         <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                           <span className="group-open:hidden">📄 Show Raw Data</span>
                           <span className="hidden group-open:inline">📄 Hide Raw Data</span>
                         </summary>
                         <div className="mt-3 max-h-96 overflow-y-auto">
                           <pre className="text-xs bg-gray-100 p-4 rounded-md overflow-x-auto">
                             {JSON.stringify(summaryData, null, 2)}
                           </pre>
                         </div>
                       </details>
                     </div>
                   </div>
                 </CardContent>
               </Card>
             )}

            {!summaryData && !error && (
              <Card>
                <CardContent className="pt-12 pb-12">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Analyze</h3>
                    <p className="text-gray-500">
                      Select your analysis type and parameters to generate comprehensive insights.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
    </AuthWrapper>
  )
}
