"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Send, 
  Plus, 
  MessageSquare, 
  BarChart3, 
  Download, 
  Copy, 
  ThumbsUp, 
  ThumbsDown, 
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  Users,
  Calendar,
  TrendingUp,
  Target,
  Award,
  X,
  Bot,
  User,
  Home,
  Code,
  MessageCircle,
  File,
  MoreHorizontal,
  Wifi,
  WifiOff
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"
import AuthWrapper from "@/components/AuthWrapper"
import ChatLimitBanner from "@/components/ChatLimitBanner"
import { useUser } from "@/contexts/UserContext"
import { useRouter } from "next/navigation"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function ChatPage() {
  const router = useRouter()
  const { 
    user, 
    token, 
    canChat, 
    isLimitReached, 
    isAdmin, 
    showSubscriptionModal, 
    setShowSubscriptionModal,
    refreshChatLimit 
  } = useUser()

  const [input, setInput] = useState("")
  const [messages, setMessages] = useState([{
    id: "1",
    content: "Hello! I'm your KabaddiGuru assistant. I can help you analyze player performance, match statistics, team strategies, and much more. What would you like to know about your Kabaddi data?",
    role: "assistant",
    timestamp: new Date()
  }])
  const [isLoading, setIsLoading] = useState(false)
  const [chats, setChats] = useState([])
  const [currentChatId, setCurrentChatId] = useState(null)
  const [expandedSqlQueries, setExpandedSqlQueries] = useState(new Set())
  const [suggestions, setSuggestions] = useState([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [suggestionsLoaded, setSuggestionsLoaded] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState("connected")
  const [debounceTimer, setDebounceTimer] = useState(null)
  const [summaryData, setSummaryData] = useState(null)
  const [showSummary, setShowSummary] = useState(false)
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [summaryCount, setSummaryCount] = useState(0)
  const [maxSummaries] = useState(5) // Maximum summaries allowed in free trial
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState("")
  const [feedbackStates, setFeedbackStates] = useState({}) // Track feedback state for each message
  const [showFeedbackForm, setShowFeedbackForm] = useState({}) // Track feedback form visibility
  const [feedbackText, setFeedbackText] = useState({}) // Track feedback text for each message
  const [sidebarOpen, setSidebarOpen] = useState(false) // Track sidebar open state
  const messagesEndRef = useRef(null)

  // Auto new thread after inactivity (similar to ChatGPT behavior where sessions are distinct)
  const INACTIVITY_WINDOW_MS = 20 * 60 * 1000 // 20 minutes

  // Generate a short, ChatGPT-like chat title from the first user message
  const generateChatTitleFromText = (text) => {
    if (!text) return 'New chat'
    const cleaned = text
      .replace(/[\r\n]+/g, ' ')
      .replace(/[`*_#>\-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    // Keep first 6 words and cap to ~32 chars
    const words = cleaned.split(' ').slice(0, 6).join(' ')
    const capped = words.length > 32 ? words.slice(0, 32).trim() + '…' : words
    return capped.charAt(0).toUpperCase() + capped.slice(1)
  }

  // Chat limits are managed globally in UserContext; no need to fetch here

  // Load summary count from localStorage
  useEffect(() => {
    const savedSummaryCount = localStorage.getItem('kabaddi_summary_count')
    if (savedSummaryCount) {
      const count = parseInt(savedSummaryCount, 10)
      setSummaryCount(count)
    }
  }, [])

  // Helpers for per-user and per-chat storage keys
  const getUserScopedKey = (base) => user?.user_id ? `${base}_${user.user_id}` : base
  const getMessagesKey = (chatId) => chatId ? `kabaddi_messages_${chatId}` : null

  // Load chats and current chat when user changes
  useEffect(() => {
    // Prefer user-scoped keys; gracefully fall back to base keys and migrate if needed
    const baseChatsKey = 'kabaddi_chats'
    const baseCurrentKey = 'kabaddi_current_chat_id'
    const userChatsKey = getUserScopedKey('kabaddi_chats')
    const userCurrentKey = getUserScopedKey('kabaddi_current_chat_id')

    const savedUserChats = localStorage.getItem(userChatsKey)
    const savedBaseChats = localStorage.getItem(baseChatsKey)

    let chatsJson = savedUserChats || savedBaseChats
    if (chatsJson) {
      try {
        const parsedChats = JSON.parse(chatsJson)
        const chatsWithDates = parsedChats.map(chat => ({
          ...chat,
          lastMessage: chat.lastMessage ? new Date(chat.lastMessage) : new Date()
        }))
        setChats(chatsWithDates)
        // Migrate base -> user-scoped on first load for signed-in users
        if (!savedUserChats && savedBaseChats && user?.user_id) {
          localStorage.setItem(userChatsKey, savedBaseChats)
        }
      } catch {
        setChats([])
      }
    } else {
      setChats([])
    }

    // Always start fresh on page open: do not auto-load last asked question
    setCurrentChatId(null)
    setMessages([{
      id: "1",
      content: "Hello! I'm your KabaddiGuru assistant. I can help you analyze player performance, match statistics, team strategies, and much more. What would you like to know about your Kabaddi data?",
      role: "assistant",
      timestamp: new Date()
    }])

    // Optionally clear stored current chat pointer so refreshes also start fresh
    try {
      localStorage.removeItem(userCurrentKey)
      localStorage.removeItem(baseCurrentKey)
    } catch {}
  }, [user])

  // Save current chat id per user
  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem(getUserScopedKey('kabaddi_current_chat_id'), currentChatId)
    }
  }, [currentChatId, user])

  useEffect(() => {
    const mk = getMessagesKey(currentChatId)
    if (mk) {
      localStorage.setItem(mk, JSON.stringify(messages))
    }
  }, [messages, currentChatId])

  // Load messages for current chat
  useEffect(() => {
    if (!currentChatId) return
    
    const mk = getMessagesKey(currentChatId)
    if (mk) {
      const savedMessages = localStorage.getItem(mk)
      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages)
          const messagesWithDates = parsedMessages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
          setMessages(messagesWithDates)
        } catch {
          console.error("Error parsing saved messages")
        }
      }
    }
  }, [currentChatId])

  // Save chats to localStorage
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem(getUserScopedKey('kabaddi_chats'), JSON.stringify(chats))
    }
  }, [chats, user])

  // Load suggestions
  useEffect(() => {
    if (!suggestionsLoaded && !suggestionsLoading) {
      loadSuggestions()
    }
  }, [suggestionsLoaded, suggestionsLoading])

  const loadSuggestions = async () => {
    setSuggestionsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/suggestions`)
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions || [])
      }
    } catch (error) {
      console.error("Error loading suggestions:", error)
    } finally {
      setSuggestionsLoading(false)
      setSuggestionsLoaded(true)
    }
  }

  const sendMessage = async (message, chatId, authToken) => {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authToken && { "Authorization": `Bearer ${authToken}` })
      },
      body: JSON.stringify({
        message: message,
        chat_id: chatId
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || "Failed to send message")
    }

    return await response.json()
  }

  const generateSummary = async (chatId) => {
    const response = await fetch(`${API_BASE_URL}/summary`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` })
      },
      body: JSON.stringify({ chat_id: chatId })
    })

    if (!response.ok) {
      throw new Error("Failed to generate summary")
    }

    return await response.json()
  }

  const submitFeedback = async (feedbackData) => {
    const response = await fetch(`${API_BASE_URL}/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` })
      },
      body: JSON.stringify(feedbackData)
    })

    if (!response.ok) {
      throw new Error("Failed to submit feedback")
    }

    return await response.json()
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return

    // Check if user can chat (for non-admin users)
    if (!isAdmin && !canChat) {
      setShowSubscriptionModal(true)
      return
    }

    // Clear any pending debounce timer
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      setDebounceTimer(null)
    }

    const currentInput = input
    const now = new Date()
    const lastMsgTs = messages.length ? new Date(messages[messages.length - 1].timestamp) : null
    const needsNewChatDueToInactivity = Boolean(
      currentChatId && lastMsgTs && now - lastMsgTs > INACTIVITY_WINDOW_MS
    )

    const userMessage = {
      id: Date.now().toString(),
      content: currentInput,
      role: "user",
      timestamp: now
    }

    setInput("")
    setIsLoading(true)

    // Determine chat id to use for this send
    let usedChatId = currentChatId
    let provisionalId = null
    const startingNewChat = (!currentChatId && messages.length === 1) || needsNewChatDueToInactivity

    if (startingNewChat) {
      provisionalId = Date.now().toString()
      const newChat = {
        id: provisionalId,
        title: generateChatTitleFromText(currentInput),
        lastMessage: now
      }
      setChats(prev => [newChat, ...prev])
      setCurrentChatId(provisionalId)
      usedChatId = provisionalId

      // Reset visible messages to a fresh thread (greeting + this user message)
      const greeting = {
        id: "1",
        content: "Hello! I'm your KabaddiGuru assistant. I can help you analyze player performance, match statistics, team strategies, and much more. What would you like to know about your Kabaddi data?",
        role: "assistant",
        timestamp: now
      }
      setMessages([greeting, userMessage])

      // persist initial messages for this provisional chat
      const mk = getMessagesKey(provisionalId)
      if (mk) {
        try {
          localStorage.setItem(mk, JSON.stringify([
            greeting,
            userMessage
          ]))
        } catch {}
      }
    } else {
      // Continue existing thread
      setMessages(prev => [...prev, userMessage])
    }

    // Add optimistic loading message
    const loadingMessage = {
      id: (Date.now() + 1).toString(),
      content: "Processing your request... This may take a few moments for complex queries.",
      role: "assistant",
      timestamp: new Date(),
      isLoading: true
    }
    setMessages(prev => [...prev, loadingMessage])

    try {
      // Call the real backend API - no timeout to allow for long processing
      const startTime = Date.now();
      const response = await sendMessage(currentInput, usedChatId, token)
      const endTime = Date.now();
      
      // Remove loading message and add real response
      setMessages(prev => prev.filter(msg => !msg.isLoading))
      
      // Chat count is incremented on the backend automatically
      
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        role: "assistant",
        timestamp: new Date(),
        sql_query: response.sql_query,
        response_time: response.response_time,
        userQuestion: currentInput // Store the user question for feedback
      }
      setMessages(prev => [...prev, aiResponse])

      // Update chat title if this was a new chat
      if (provisionalId) {
        setChats(prev => prev.map(chat => 
          chat.id === provisionalId 
            ? { ...chat, title: generateChatTitleFromText(currentInput) }
            : chat
        ))
      }

      // Update last message time for current chat
      setChats(prev => prev.map(chat => 
        chat.id === usedChatId 
          ? { ...chat, lastMessage: now }
          : chat
      ))

      // Refresh chat limits after successful message
      await refreshChatLimit()

    } catch (error) {
      console.error("Error sending message:", error)
      
      // Remove loading message
      setMessages(prev => prev.filter(msg => !msg.isLoading))
      
      // Add error message
      const errorMessage = {
        id: Date.now().toString(),
        content: error.message === "Free trial limit reached. Please upgrade to premium for unlimited chats." 
          ? "You've reached your free trial limit. Please upgrade to premium to continue chatting."
          : "Sorry, I encountered an error processing your request. Please try again.",
        role: "assistant",
        timestamp: new Date(),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])

      // If it's a limit error, show subscription modal
      if (error.message.includes("Free trial limit reached")) {
        setShowSubscriptionModal(true)
        await refreshChatLimit()
      }

      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, currentChatId, messages.length, connectionStatus, debounceTimer, canChat, isAdmin, token, refreshChatLimit])

  const startNewChat = () => {
    setMessages([{
      id: "1",
      content: "Hello! I'm your KabaddiGuru assistant. I can help you analyze player performance, match statistics, team strategies, and much more. What would you like to know about your Kabaddi data?",
      role: "assistant",
      timestamp: new Date()
    }])
    setCurrentChatId(null)
    setExpandedSqlQueries(new Set())
    setSummaryData(null)
    setShowSummary(false)
    
    // Clear localStorage for new session
    localStorage.removeItem(getUserScopedKey('kabaddi_current_chat_id'))
    
    // Keep suggestions loaded to avoid unnecessary API calls
    // setSuggestionsLoaded(false) // Uncomment if you want fresh suggestions for new chat
  }

  const handleGenerateSummary = async () => {
    if (!currentChatId || isGeneratingSummary) return
    
    // Check summary limit only for non-admin users
    if (!isAdmin && summaryCount >= maxSummaries) {
      setShowSubscriptionModal(true)
      return
    }
    
    setIsGeneratingSummary(true)
    try {
      const summaryResponse = await generateSummary(currentChatId)
      
      setSummaryData(summaryResponse)
      setShowSummary(true)
      
      // Increment summary count and save to localStorage (only for non-admin users)
      if (!isAdmin) {
        const newCount = summaryCount + 1
        setSummaryCount(newCount)
        localStorage.setItem('kabaddi_summary_count', newCount.toString())
      }
    } catch (error) {
      // Show error message to user
      const errorMessage = {
        id: Date.now().toString(),
        content: "Failed to generate conversation summary. Please try again.",
        role: "assistant",
        timestamp: new Date(),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsGeneratingSummary(false)
    }
  }

  const handleFeedback = async (messageId, feedbackType, message) => {
    try {
      const feedbackData = {
        user_question: message.userQuestion || "",
        ai_response: message.content,
        sql_query: message.sql_query || "",
        feedback_type: feedbackType,
        feedback_text: feedbackText[messageId] || "",
        response_time: message.response_time || 0,
        tokens_used: 0, // We don't track tokens in frontend
        chat_id: currentChatId
      }

      await submitFeedback(feedbackData)
      
      // Update feedback state
      setFeedbackStates(prev => ({
        ...prev,
        [messageId]: feedbackType
      }))
      
      // Clear feedback form
      setShowFeedbackForm(prev => ({
        ...prev,
        [messageId]: false
      }))
      
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!",
      })
    } catch (error) {
      console.error("Error submitting feedback:", error)
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive"
      })
    }
  }

  const toggleFeedbackForm = (messageId) => {
    setShowFeedbackForm(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }))
  }

  const toggleSqlQuery = (messageId) => {
    setExpandedSqlQueries(prev => {
      const newSet = new Set(prev)
      if (newSet.has(messageId)) {
        newSet.delete(messageId)
      } else {
        newSet.add(messageId)
      }
      return newSet
    })
  }

  // Component for rendering formatted AI responses
  const FormattedResponse = ({ content }) => {
    // Convert markdown-style content to proper JSX
    const formatContent = (text) => {
      if (!text) return ""
      
      // Handle tables with robust parsing
      const tableRegex = /\|(.*?)\|\n\|(.*?)\|\n((?:\|(.*?)\|\n?)*)/g
      let formattedText = text.replace(tableRegex, (match, headers, separator, rows) => {
        try {
          // Parse headers - split by | and clean up
          const headerCells = headers.split('|').map(h => h.trim()).filter(h => h)
          
          // Parse rows - split by newlines first, then by |
          const rowsArray = rows.trim().split('\n').map(row => {
            const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell)
            return cells
          }).filter(row => row.length > 0 && row.length === headerCells.length)
          
          if (headerCells.length === 0 || rowsArray.length === 0) {
            return match // Return original if parsing fails
          }
          
          let tableHtml = '<div class="overflow-x-auto my-4"><table class="min-w-full border border-gray-200 rounded-lg">'
          tableHtml += '<thead class="bg-gray-50"><tr>'
          headerCells.forEach(header => {
            tableHtml += `<th class="px-4 py-2 text-left text-sm font-semibold text-gray-900 border-b">${header}</th>`
          })
          tableHtml += '</tr></thead><tbody>'
          
          rowsArray.forEach((row, index) => {
            tableHtml += `<tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">`
            row.forEach(cell => {
              tableHtml += `<td class="px-4 py-2 text-sm text-gray-700 border-b">${cell}</td>`
            })
            tableHtml += '</tr>'
          })
          
          tableHtml += '</tbody></table></div>'
          return tableHtml
        } catch (error) {
          console.error('Table parsing error:', error)
          return match // Return original if parsing fails
        }
      })
      
      // Alternative table parsing for malformed tables
      const alternativeTableRegex = /Here are the top raiders by total points scored:\s*\n\s*\n((?:\|.*\|\n?)+)/g
      formattedText = formattedText.replace(alternativeTableRegex, (match, tableContent) => {
        try {
          const lines = tableContent.trim().split('\n').filter(line => line.trim())
          if (lines.length < 3) return match
          
          // Extract headers from first line
          const headerLine = lines[0]
          const headerCells = headerLine.split('|').map(h => h.trim()).filter(h => h)
          
          // Extract data rows (skip header and separator lines)
          const dataRows = lines.slice(2).map(line => {
            const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell)
            return cells
          }).filter(row => row.length > 0)
          
          if (headerCells.length === 0 || dataRows.length === 0) {
            return match
          }
          
          let tableHtml = '<div class="overflow-x-auto my-4"><table class="min-w-full border border-gray-200 rounded-lg">'
          tableHtml += '<thead class="bg-gray-50"><tr>'
          headerCells.forEach(header => {
            tableHtml += `<th class="px-4 py-2 text-left text-sm font-semibold text-gray-900 border-b">${header}</th>`
          })
          tableHtml += '</tr></thead><tbody>'
          
          dataRows.forEach((row, index) => {
            tableHtml += `<tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">`
            row.forEach(cell => {
              tableHtml += `<td class="px-4 py-2 text-sm text-gray-700 border-b">${cell}</td>`
            })
            tableHtml += '</tr>'
          })
          
          tableHtml += '</tbody></table></div>'
          return tableHtml
        } catch (error) {
          console.error('Alternative table parsing error:', error)
          return match
        }
      })
      
      // General table parsing for any markdown table
      const generalTableRegex = /((?:\|.*\|\n?)+)/g
      formattedText = formattedText.replace(generalTableRegex, (match) => {
        // Skip if already processed by other table parsers
        if (match.includes('<table')) return match
        
        try {
          const lines = match.trim().split('\n').filter(line => line.trim() && line.includes('|'))
          if (lines.length < 3) return match
          
          // Check if it's a proper table structure
          const firstLine = lines[0]
          const secondLine = lines[1]
          
          // Skip if second line doesn't look like a separator
          if (!secondLine.match(/^\|[\s\-:|]+\|$/)) return match
          
          // Extract headers from first line
          const headerCells = firstLine.split('|').map(h => h.trim()).filter(h => h)
          
          // Extract data rows (skip header and separator lines)
          const dataRows = lines.slice(2).map(line => {
            const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell)
            return cells
          }).filter(row => row.length > 0 && row.length === headerCells.length)
          
          if (headerCells.length === 0 || dataRows.length === 0) {
            return match
          }
          
          let tableHtml = '<div class="overflow-x-auto my-4"><table class="min-w-full border border-gray-200 rounded-lg">'
          tableHtml += '<thead class="bg-gray-50"><tr>'
          headerCells.forEach(header => {
            tableHtml += `<th class="px-4 py-2 text-left text-sm font-semibold text-gray-900 border-b">${header}</th>`
          })
          tableHtml += '</tr></thead><tbody>'
          
          dataRows.forEach((row, index) => {
            tableHtml += `<tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">`
            row.forEach(cell => {
              tableHtml += `<td class="px-4 py-2 text-sm text-gray-700 border-b">${cell}</td>`
            })
            tableHtml += '</tr>'
          })
          
          tableHtml += '</tbody></table></div>'
          return tableHtml
        } catch (error) {
          console.error('General table parsing error:', error)
          return match
        }
      })
      
      // Handle bold text
      formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      
      // Handle bullet points
      formattedText = formattedText.replace(/^\* (.*$)/gim, '<li class="ml-4">$1</li>')
      formattedText = formattedText.replace(/(<li.*<\/li>)/s, '<ul class="list-disc pl-4 my-2">$1</ul>')
      
      // Handle line breaks
      formattedText = formattedText.replace(/\n/g, '<br>')
      
      return formattedText
    }

    return (
      <div 
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: formatContent(content) }}
      />
    )
  }

  return (
    <AuthWrapper>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gradient-to-br from-orange-50/90 via-red-50/90 to-yellow-50/90 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 flex flex-col ${
        sidebarOpen 
          ? 'fixed inset-y-0 left-0 z-50 w-80 lg:relative lg:z-auto lg:w-80' 
          : 'hidden lg:flex lg:w-80'
      }`}>
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">KabaddiGuru</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={startNewChat}
                className={`${isLimitReached ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-gray-900'}`}
                disabled={isLimitReached}
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="text-gray-600 hover:text-gray-900 lg:hidden"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          <div className="mb-4">
            <nav className="space-y-1">
              <Link href="/" className="flex items-center space-x-2 px-2 py-2 text-sm rounded-md hover:bg-gray-100">
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>
              {/* <Link href="/dashboard" className="flex items-center space-x-2 px-2 py-2 text-sm rounded-md hover:bg-gray-100">
                <BarChart3 className="w-4 h-4" />
                <span>Dashboard</span>
              </Link> */}
              <Link href="/analytics" className="flex items-center space-x-2 px-2 py-2 text-sm rounded-md hover:bg-gray-100">
                <BarChart3 className="w-4 h-4" />
                <span>Analytics Tool</span>
              </Link>
              {/* <Link href="/upload" className="flex items-center space-x-2 px-2 py-2 text-sm rounded-md hover:bg-gray-100">
                <Upload className="w-4 h-4" />
                <span>Upload Data</span>
              </Link> */}
            </nav>
          </div>

          <div className="space-y-1">
            <div className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Recent Chats
            </div>
            {chats.map((chat) => (
              <Button
                key={chat.id}
                variant="ghost"
                className="w-full justify-start text-left h-auto p-2 hover:bg-gray-100"
                onClick={() => {
                  setCurrentChatId(chat.id)
                  // Load messages for this chat from storage
                  const mk = getMessagesKey(chat.id)
                  const savedMessages = mk ? localStorage.getItem(mk) : null
                  if (savedMessages) {
                    try {
                      const parsed = JSON.parse(savedMessages)
                      const withDates = parsed.map(m => ({ ...m, timestamp: new Date(m.timestamp) }))
                      setMessages(withDates)
                    } catch {}
                  } else {
                    setMessages([{
                      id: "1",
                      content: "Hello! I'm your KabaddiGuru assistant. I can help you analyze player performance, match statistics, team strategies, and much more. What would you like to know about your Kabaddi data?",
                      role: "assistant",
                      timestamp: new Date()
                    }])
                  }
                  setSidebarOpen(false) // Close sidebar on mobile after selection
                }}
              >
                <div className="flex items-start space-x-2 w-full">
                  <MessageSquare className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {chat.title || 'Untitled chat'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {chat.lastMessage instanceof Date && !isNaN(chat.lastMessage) 
                        ? chat.lastMessage.toLocaleDateString() 
                        : new Date(chat.lastMessage).toLocaleDateString()}
                    </div>
                  </div>
                  <MoreHorizontal className="w-3 h-3 text-gray-400" />
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="border-b border-gray-200 bg-white p-4 flex-shrink-0">
                        <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                  <div>
                    <h1 className="text-lg lg:text-xl font-semibold text-gray-900">KabaddiGuru Chat</h1>
                    <p className="text-sm text-gray-500 hidden sm:block">Ask questions about your Kabaddi data</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link href="/analytics">
                    <Button
                      size="sm"
                      className="text-xs bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg"
                    >
                      <BarChart3 className="w-3 h-3 mr-1" />
                      Analytics Tool
                    </Button>
                  </Link>
                  {currentChatId && messages.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateSummary}
                                        disabled={isGeneratingSummary || isLimitReached || summaryCount >= maxSummaries}
                  className={`text-xs ${isLimitReached || summaryCount >= maxSummaries ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <File className="w-3 h-3 mr-1" />
                      {isGeneratingSummary ? "Generating..." : `Summary (${summaryCount}/${maxSummaries})`}
                    </Button>
                  )}
                  <Badge 
                    variant="secondary" 
                    className={`flex items-center space-x-1 ${
                      connectionStatus === "online" 
                        ? "bg-green-100 text-green-800" 
                        : connectionStatus === "offline"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {connectionStatus === "online" ? (
                      <>
                        <Wifi className="w-3 h-3" />
                        <span>Online</span>
                      </>
                    ) : connectionStatus === "offline" ? (
                      <>
                        <WifiOff className="w-3 h-3" />
                        <span>Offline</span>
                      </>
                    ) : (
                      <span>Connecting...</span>
                    )}
                  </Badge>
                </div>
              </div>
          </header>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-6xl mx-auto space-y-4">
            {/* Team Selector Banner */}
            <div className="flex items-center justify-between bg-white border rounded-md p-3">
              <div className="text-sm text-gray-700">
                Team context: <span className="font-medium">{selectedTeam || 'Not set'}</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsTeamModalOpen(true)} className="text-xs">{selectedTeam ? 'Change team' : 'Select team'}</Button>
            </div>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <Avatar className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500">
                    <AvatarFallback>
                      <Bot className="w-4 h-4 text-white" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <Card className={`w-full max-w-4xl lg:max-w-5xl ${
                  message.role === "user" 
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white" 
                    : "bg-white border-gray-200"
                }`}>
                  <CardContent className="p-4 lg:p-6">
                    {message.role === "user" ? (
                      <p className="text-sm lg:text-base leading-relaxed">{message.content}</p>
                    ) : (
                      <div>
                        <FormattedResponse content={message.content} />
                        
                        {/* SQL Query Toggle Button - only show for assistant messages with SQL */}
                        {message.sql_query && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleSqlQuery(message.id)}
                              className={`text-xs flex items-center space-x-1 ${
                                isLimitReached 
                                  ? 'text-gray-400 cursor-not-allowed' 
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                              disabled={isLimitReached}
                            >
                              <Code className="w-3 h-3" />
                              <span>
                                {expandedSqlQueries.has(message.id) ? "Hide" : "Show"} SQL Query
                              </span>
                              {expandedSqlQueries.has(message.id) ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </Button>
                            
                            {/* SQL Query Display */}
                            {expandedSqlQueries.has(message.id) && (
                              <div className="mt-2 p-3 bg-gray-50 rounded-md border">
                                <p className="text-xs text-gray-500 mb-2 font-medium">Generated SQL Query:</p>
                                <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono bg-white p-2 rounded border overflow-x-auto">
                                  {message.sql_query}
                                </pre>
                                {message.response_time && (
                                  <p className="text-xs text-gray-400 mt-2">
                                    Executed in {typeof message.response_time === 'number' ? message.response_time.toFixed(2) : message.response_time}s
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Feedback Section - only show for assistant messages */}
                        {message.role === "assistant" && !message.isError && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">Was this helpful?</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleFeedback(message.id, 'thumbs_up', message)}
                                  className={`text-xs p-1 h-6 ${
                                    feedbackStates[message.id] === 'thumbs_up' 
                                      ? 'text-green-600 bg-green-50' 
                                      : isLimitReached 
                                        ? 'text-gray-400 cursor-not-allowed' 
                                        : 'text-gray-600 hover:text-green-600'
                                  }`}
                                  disabled={feedbackStates[message.id] !== undefined || isLimitReached}
                                >
                                  <ThumbsUp className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleFeedback(message.id, 'thumbs_down', message)}
                                  className={`text-xs p-1 h-6 ${
                                    feedbackStates[message.id] === 'thumbs_down' 
                                      ? 'text-red-600 bg-red-50' 
                                      : isLimitReached 
                                        ? 'text-gray-400 cursor-not-allowed' 
                                        : 'text-gray-600 hover:text-red-600'
                                  }`}
                                  disabled={feedbackStates[message.id] !== undefined || isLimitReached}
                                >
                                  <ThumbsDown className="w-3 h-3" />
                                </Button>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleFeedbackForm(message.id)}
                                className={`text-xs flex items-center space-x-1 ${
                                  isLimitReached 
                                    ? 'text-gray-400 cursor-not-allowed' 
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                                disabled={isLimitReached}
                              >
                                <MessageCircle className="w-3 h-3" />
                                <span>Add comment</span>
                              </Button>
                            </div>
                            
                            {/* Feedback Form */}
                            {showFeedbackForm[message.id] && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                                <textarea
                                  placeholder={isLimitReached ? "Upgrade to premium to provide feedback..." : "Add your feedback or suggestions..."}
                                  value={feedbackText[message.id] || ""}
                                  onChange={(e) => {
                                    if (isLimitReached) return
                                    setFeedbackText(prev => ({
                                      ...prev,
                                      [message.id]: e.target.value
                                    }))
                                  }}
                                  className={`w-full p-2 text-xs border border-gray-300 rounded-md resize-none ${isLimitReached ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  rows={2}
                                  disabled={isLimitReached}
                                />
                                <div className="flex justify-end space-x-2 mt-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toggleFeedbackForm(message.id)}
                                    className="text-xs"
                                    disabled={isLimitReached}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleFeedback(message.id, 'suggestion', message)}
                                    className="text-xs"
                                    disabled={!feedbackText[message.id]?.trim() || isLimitReached}
                                  >
                                    Submit
                                  </Button>
                                </div>
                              </div>
                            )}
                            
                            {/* Feedback Submitted Message */}
                            {feedbackStates[message.id] && (
                              <div className="mt-2 text-xs text-green-600">
                                ✓ Feedback submitted
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className={`text-xs mt-2 ${
                      message.role === "user" ? "text-orange-100" : "text-gray-500"
                    }`}>
                      {message.timestamp instanceof Date && !isNaN(message.timestamp)
                        ? message.timestamp.toLocaleTimeString()
                        : new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </CardContent>
                </Card>

                {message.role === "user" && (
                  <Avatar className="w-8 h-8 bg-gray-600">
                    <AvatarFallback>
                      <User className="w-4 h-4 text-white" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start space-x-3">
                <Avatar className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500">
                  <AvatarFallback>
                    <Bot className="w-4 h-4 text-white" />
                  </AvatarFallback>
                </Avatar>
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {/* Summary Display */}
            {showSummary && summaryData && (
              <div className="max-w-4xl mx-auto mt-6">
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <File className="w-5 h-5 mr-2 text-blue-600" />
                        Conversation Summary
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSummary(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Summary Text */}
                      <div className="bg-white p-4 rounded-lg border">
                        <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                          {summaryData.summary}
                        </p>
                      </div>
                      
                      {/* Session Statistics */}
                      {summaryData.session_stats && Object.keys(summaryData.session_stats).length > 0 && (
                        <div className="bg-white p-4 rounded-lg border">
                          <h4 className="font-medium text-gray-900 mb-2">Session Statistics</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Total Questions:</span>
                              <div className="font-medium">{summaryData.session_stats.total_questions || 0}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Total Tokens:</span>
                              <div className="font-medium">{summaryData.session_stats.total_tokens || 0}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Avg Tokens/Question:</span>
                              <div className="font-medium">
                                {summaryData.session_stats.avg_tokens_per_question 
                                  ? Math.round(summaryData.session_stats.avg_tokens_per_question) 
                                  : 0}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">Session Duration:</span>
                              <div className="font-medium">
                                {summaryData.session_stats.session_duration 
                                  ? Math.round(summaryData.session_stats.session_duration / 60) + ' min'
                                  : 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Conversation Highlights */}
                      {summaryData.conversation_highlights && summaryData.conversation_highlights.length > 0 && (
                        <div className="bg-white p-4 rounded-lg border">
                          <h4 className="font-medium text-gray-900 mb-2">Recent Highlights</h4>
                          <div className="space-y-3">
                            {summaryData.conversation_highlights.slice(0, 3).map((highlight, index) => (
                              <div key={index} className="text-sm border-l-2 border-blue-200 pl-3">
                                <p className="text-gray-700 whitespace-pre-wrap">{highlight}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t border-gray-200 bg-white p-4 flex-shrink-0">
          <div className="max-w-6xl mx-auto">
            {/* Chat Limit Banner */}
            <ChatLimitBanner variant="default" />
            
            {/* Enhanced Suggestions Display */}
            {(suggestions.length > 0 || suggestionsLoading) && (
              <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900 flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2 text-blue-600" />
                    Suggested Questions
                  </h3>
                  {suggestionsLoading && (
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {suggestions.slice(0, 6).map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setInput(suggestion)}
                      className="text-xs h-auto p-2 text-left justify-start bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-300"
                      disabled={isLoading}
                    >
                      <div className="truncate">
                        {suggestion.length > 50 ? suggestion.slice(0, 50) + "..." : suggestion}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Summary Limit Warning */}
            {!isAdmin && summaryCount >= maxSummaries && (
              <div className="mb-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-yellow-600 font-bold text-xs">!</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-yellow-900">Summary Limit Reached</h3>
                      <p className="text-xs text-yellow-700">You've used all {maxSummaries} summary generations. Upgrade to premium for unlimited summaries.</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowSubscriptionModal(true)}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-xs px-3 py-1"
                  >
                    Upgrade Now
                  </Button>
                </div>
              </div>
            )}

            {/* Fallback Suggestions */}
            {suggestions.length === 0 && !suggestionsLoading && (
              <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2 text-orange-600" />
                  Quick Start Questions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInput("Show me top performing raiders this season")}
                    className="text-xs h-auto p-2 text-left justify-start bg-white hover:bg-orange-50 border-orange-200 hover:border-orange-300"
                    disabled={isLoading}
                  >
                    Top Raiders
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInput("Analyze team defensive strategies")}
                    className="text-xs h-auto p-2 text-left justify-start bg-white hover:bg-orange-50 border-orange-200 hover:border-orange-300"
                    disabled={isLoading}
                  >
                    Defense Analysis
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInput("Compare match performance trends")}
                    className="text-xs h-auto p-2 text-left justify-start bg-white hover:bg-orange-50 border-orange-200 hover:border-orange-300"
                    disabled={isLoading}
                  >
                    Match Trends
                  </Button>
                </div>
              </div>
            )}
            
            {/* Input Section */}
            <div className="flex space-x-2">
                <Input
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value)
                    // Debounce input changes to prevent rapid requests
                    if (debounceTimer) {
                      clearTimeout(debounceTimer)
                    }
                    const timer = setTimeout(() => {
                      // Auto-suggestions could be triggered here
                    }, 500)
                    setDebounceTimer(timer)
                  }}
                  placeholder="Ask about player stats, match analysis, team performance..."
                  className="flex-1 min-w-0"
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Modal moved to global layout via ClientGlobalUI */}

      {/* Team Selection Modal (simple inline modal) */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-gray-900">Select your team</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsTeamModalOpen(false)} className="text-gray-500"><X className="w-4 h-4" /></Button>
            </div>
            <p className="text-sm text-gray-600 mb-3">We’ll tailor suggested questions to your team.</p>
            <div className="space-y-2 mb-4">
              {/* Simple preset list; adjust as needed */}
              {['Bengaluru Bulls', 'Telugu Titans', 'Puneri Paltan', 'Haryana Steelers', 'U Mumba', 'Jaipur Pink Panthers'].map((team) => (
                <Button key={team} variant={selectedTeam === team ? 'default' : 'outline'} size="sm" className="w-full justify-start" onClick={() => setSelectedTeam(team)}>
                  {team}
                </Button>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <Input placeholder="Or type your team name" value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)} />
              <Button onClick={() => { localStorage.setItem('kabaddi_selected_team', selectedTeam || ''); setIsTeamModalOpen(false); }}>Save</Button>
            </div>
          </div>
        </div>
      )}

    </div>
    </AuthWrapper>
  )
}
