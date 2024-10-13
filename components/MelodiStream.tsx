"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import axios from 'axios'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Home, Search, Library, PlusCircle, Heart, Rss, PlayCircle, SkipBack, SkipForward, Repeat, Shuffle, LayoutList, Laptop2, Volume, Maximize2, Mic2, Sun, Moon, ChevronLeft, ChevronRight, User, Play, Edit, Trash2, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
//import { useRouter } from 'next/router'; // Import correctly


export default function MelodiStream() {
  //const router = useRouter()
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSong, setCurrentSong] = useState(null)
  const [activeTab, setActiveTab] = useState("home")
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false)
  const [userPlaylists, setUserPlaylists] = useState([])
  const [newPlaylistName, setNewPlaylistName] = useState("")
  const [user, setUser] = useState(null)
  const [playlists, setPlaylists] = useState([])
  const [featuredPlaylists, setFeaturedPlaylists] = useState([])
  const [accessToken, setAccessToken] = useState('')
  const [refreshToken, setRefreshToken] = useState('')
  const router = useRouter()
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, playlistData, featuredData] = await Promise.all([
          axios.get('/api/spotify?endpoint=me'),
          axios.get('/api/spotify?endpoint=user-playlists'),
          axios.get('/api/spotify?endpoint=featured-playlists')
        ])
        setUser(userData.data)
        setPlaylists(playlistData.data.items)
        setFeaturedPlaylists(featuredData.data.playlists.items)
      } catch (error) {
        console.error('Error fetching data:', error)
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          router.push('/api/auth/login')
        }
      }
    }
    fetchData()
  }, [router])



  useEffect(() => {
    const fetchData = async (endpoint) => {
      try {
        const response = await fetch(`/api/spotify?endpoint=${endpoint}`)
        if (response.redirected) {
          router.push(response.url)
          return null
        }
        if (!response.ok) {
          throw new Error('Failed to fetch')
        }
        return await response.json()
      } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error)
        return null
      }
    }

    const loadData = async () => {
      const userData = await fetchData('me')
      if (userData) setUser(userData)

      const playlistData = await fetchData('user-playlists')
      if (playlistData) setPlaylists(playlistData.items)

      const featuredData = await fetchData('featured-playlists')
      if (featuredData) setFeaturedPlaylists(featuredData.playlists.items)
    }

    loadData()
  }, [router])

  const playSong = async (uri) => {
    try {
      await fetch('/api/spotify?endpoint=play', {
        method: 'POST',
        body: JSON.stringify({ uris: [uri] }),
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (error) {
      console.error('Error playing song:', error)
    }
  }

  useEffect(() => {
    document.body.classList.toggle('dark', isDarkMode)
  }, [isDarkMode])

  useEffect(() => {
    fetchUserData()
    fetchUserPlaylists()
    fetchFeaturedPlaylists()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await axios.get('/api/spotify?endpoint=me')
      setUser(response.data)
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const fetchUserPlaylists = async () => {
    try {
      const response = await axios.get('/api/spotify?endpoint=user-playlists')
      setUserPlaylists(response.data.items)
    } catch (error) {
      console.error('Error fetching user playlists:', error)
    }
  }

  const fetchFeaturedPlaylists = async () => {
    try {
      const response = await axios.get('/api/spotify?endpoint=featured-playlists')
      setFeaturedPlaylists(response.data.playlists.items)
    } catch (error) {
      console.error('Error fetching featured playlists:', error)
    }
  }

  const handleSearch = async (e) => {
    const query = e.target.value
    setSearchQuery(query)
    
    if (query.length > 2) {
      try {
        const response = await axios.get(`/api/spotify?endpoint=search&q=${query}`)
        setSearchResults(response.data.tracks.items)
        setShowSearchSuggestions(true)
      } catch (error) {
        console.error('Error searching:', error)
      }
    } else {
      setSearchResults([])
      setShowSearchSuggestions(false)
    }
  }

  const handleSearchFocus = () => {
    setShowSearchSuggestions(true)
  }

  const handleSearchBlur = () => {
    setTimeout(() => setShowSearchSuggestions(false), 200)
  }

  {/* 
  const playSong = async (song) => {
    try {
      await axios.post('/api/spotify?endpoint=play', { uris: [song.uri] })
      setCurrentSong(song)
      setIsPlaying(true)
    } catch (error) {
      console.error('Error playing song:', error)
    }
  }
*/}
  const togglePlayPause = async () => {
    try {
      if (isPlaying) {
        await axios.post('/api/spotify?endpoint=pause')
      } else {
        await axios.post('/api/spotify?endpoint=play')
      }
      setIsPlaying(!isPlaying)
    } catch (error) {
      console.error('Error toggling play/pause:', error)
    }
  }

  const nextTrack = async () => {
    try {
      await axios.post('/api/spotify?endpoint=next')
      // You might want to fetch the new current track here
    } catch (error) {
      console.error('Error skipping to next track:', error)
    }
  }

  const previousTrack = async () => {
    try {
      await axios.post('/api/spotify?endpoint=previous')
      // You might want to fetch the new current track here
    } catch (error) {
      console.error('Error going to previous track:', error)
    }
  }

  const createPlaylist = async () => {
    if (newPlaylistName.trim()) {
      try {
        const response = await axios.post('/api/spotify?endpoint=create-playlist', { name: newPlaylistName })
        setUserPlaylists([...userPlaylists, response.data])
        setNewPlaylistName("")
      } catch (error) {
        console.error('Error creating playlist:', error)
      }
    }
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const CarouselSection = ({ title, items, itemType }) => (
    <div className="relative">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      <div className="relative">
        <ScrollArea className="overflow-x-auto whitespace-nowrap" orientation="horizontal">
          <div className="flex space-x-4 p-4">
            {items.map((item) => (
              <motion.div
                key={item.id}
                className="w-48 shrink-0 transition-transform duration-300 ease-in-out transform hover:scale-105"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative group">
                  <Image src={item.images[0]?.url || '/placeholder.svg'} alt={item.name} width={192} height={192} className="rounded-lg" />
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute bottom-2 right-2 text-white hover:text-primary bg-gradient-to-r from-primary to-secondary rounded-full p-2 shadow-lg"
                      onClick={() => itemType === 'track' ? playSong(item) : router.push(`/playlist/${item.id}`)}
                    >
                      <Play className="h-8 w-8" />
                    </Button>
                  </div>
                </div>
                <h3 className="mt-2 font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-400">{itemType === 'track' ? item.artists[0].name : item.description}</p>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )

  return (
    <div className={`h-screen flex flex-col ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-black text-white' : 'bg-gradient-to-br from-gray-100 to-white text-gray-900'} transition-colors duration-500`}>
      <header className={`h-16 ${isDarkMode ? 'bg-black/5' : 'bg-white/5'} backdrop-filter backdrop-blur-lg flex items-center px-6 justify-between border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-4">
          <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">MelodiStream</div>
          <nav>
            <Button variant="ghost" onClick={() => setActiveTab("home")}>Home</Button>
            <Button variant="ghost" onClick={() => setActiveTab("search")}>Search</Button>
            <Button variant="ghost" onClick={() => setActiveTab("library")}>Your Library</Button>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Input 
              className={`w-64 ${isDarkMode ? 'bg-white/10' : 'bg-gray-100'} border-0 placeholder-gray-400`}
              placeholder="Search for songs, artists, or podcasts"
              value={searchQuery}
              onChange={handleSearch}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
            />
            
            <AnimatePresence>
              {showSearchSuggestions && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`absolute z-10 w-full mt-1 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-md shadow-lg`}
                >
                  {searchResults.map((song) => (
                    <div
                      key={song.id}
                      className={`p-2 hover:bg-gray-100 cursor-pointer ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      onClick={() => playSong(song)}
                    >
                      {song.name} - {song.artists[0].name}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={toggleTheme}>
                  {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {user && (
            <Avatar>
              <AvatarImage src={user.images[0]?.url} alt={user.display_name} />
              <AvatarFallback>{user.display_name[0]}</AvatarFallback>
            </Avatar>
          )}
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className={`w-60 ${isDarkMode ? 'bg-black/30' : 'bg-white/30'} backdrop-filter backdrop-blur-md p-6 flex flex-col`}>
          <ScrollArea className="flex-grow">
            <nav className="space-y-6">
              <div className="space-y-3">
                <Button variant="ghost" className="w-full justify-start hover:bg-white/10" onClick={() => setActiveTab("home")}>
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Button>
                <Button variant="ghost" className="w-full justify-start hover:bg-white/10" onClick={() => setActiveTab("search")}>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
                <Button variant="ghost" className="w-full justify-start hover:bg-white/10" onClick={() => setActiveTab("library")}>
                  <Library className="mr-2 h-4 w-4" />
                  Your Library
                </Button>
              </div>
              <div className="space-y-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start hover:bg-white/10">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Playlist
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Playlist</DialogTitle>
                    </DialogHeader>
                    <Input
                      placeholder="Enter playlist name"
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                    />
                    <Button onClick={createPlaylist}>Create</Button>
                  </DialogContent>
                </Dialog>
                <Button variant="ghost" className="w-full justify-start hover:bg-white/10" onClick={() => setActiveTab("liked")}>
                  <Heart className="mr-2 h-4 w-4" />
                  Liked Songs
                </Button>
              </div>
            </nav>
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-semibold text-gray-400">YOUR PLAYLISTS</h3>
              <div className="space-y-1">
                {userPlaylists.map((playlist) => (
                  <Button key={playlist.id} variant="ghost" className="w-full justify-start font-normal hover:bg-white/10" onClick={() => router.push(`/playlist/${playlist.id}`)}>
                    {playlist.name}
                  </Button>
                ))}
              </div>
            </div>
          </ScrollArea>
        </aside>
        <main className={`flex-1 overflow-hidden ${isDarkMode ? 'bg-gradient-to-b from-blue-900/20 to-transparent' : 'bg-gradient-to-b from-blue-100/20 to-transparent'}`}>
          <ScrollArea className="h-full">
            <Tabs value={activeTab} className="w-full">
              <TabsContent value="home" className="p-6 space-y-6">
                <h1 className="text-3xl font-bold">Welcome back</h1>
                <CarouselSection title="Featured Playlists" items={featuredPlaylists} itemType="playlist" />
                {/* Add more sections as needed */}
              </TabsContent>
              <TabsContent value="search" className="p-6 space-y-6">
                <h1 className="text-3xl font-bold">Search</h1>
                <Input 
                  className={`w-full ${isDarkMode ? 'bg-white/10' : 'bg-gray-100'} border-0 placeholder-gray-400`}
                  placeholder="What do you want to listen to?" 
                  value={searchQuery}
                  onChange={handleSearch}
                />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {searchResults.map((song) => (
                    <motion.div
                      key={song.id}
                      className={`${isDarkMode ? 'bg-white/5' : 'bg-gray-100'} p-4 rounded-lg hover:bg-white/10 transition-colors duration-300`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="relative group">
                        <Image src={song.album.images[0]?.url || '/placeholder.svg'} alt={song.name} width={160} height={160} className="rounded-lg mb-2" />
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute bottom-2 right-2 text-white hover:text-primary bg-gradient-to-r from-primary to-secondary rounded-full p-2 shadow-lg"
                            onClick={() => playSong(song)}
                          >
                            <Play className="h-8 w-8" />
                          </Button>
                        </div>
                      </div>
                      <h3 className="font-semibold">{song.name}</h3>
                      <p className="text-sm text-gray-400">{song.artists[0].name}</p>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
              {/* Add more tab contents as needed */}
            </Tabs>
          </ScrollArea>
        </main>
      </div>
      <footer className={`h-20 ${isDarkMode ? 'bg-black/30' : 'bg-white/30'} backdrop-filter backdrop-blur-md border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} flex items-center px-4`}>
        <div className="flex items-center flex-1">
          {currentSong && (
            <>
              <Avatar className="h-14 w-14 mr-4">
                <AvatarImage src={currentSong.album.images[0]?.url} alt={currentSong.name} />
                <AvatarFallback>{currentSong.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">{currentSong.name}</div>
                <div className="text-xs text-gray-400">{currentSong.artists[0].name}</div>
              </div>
            </>
          )}
        </div>
        <div className="flex flex-col items-center flex-1">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="hover:bg-white/10">
              <Shuffle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-white/10" onClick={previousTrack}>
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className={`h-10 w-10 rounded-full ${isDarkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`} onClick={togglePlayPause}>
              {isPlaying ? <PlayCircle className="h-10 w-10" /> : <PlayCircle className="h-10 w-10" />}
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-white/10" onClick={nextTrack}>
              <SkipForward className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-white/10">
              <Repeat className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center w-full max-w-md space-x-2 mt-2">
            <div className="text-xs text-gray-400">0:00</div>
            <Slider defaultValue={[0]} max={100} step={1} className="w-full" />
            <div className="text-xs text-gray-400">{currentSong?.duration_ms ? Math.floor(currentSong.duration_ms / 60000) + ':' + ('0' + Math.floor((currentSong.duration_ms % 60000) / 1000)).slice(-2) : '0:00'}</div>
          </div>
        </div>
        <div className="flex items-center justify-end flex-1 space-x-2">
          <Button variant="ghost" size="icon" className="hover:bg-white/10">
            <LayoutList className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-white/10">
            <Laptop2 className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-2">
            <Volume className="h-4 w-4" />
            <Slider defaultValue={[50]} max={100} step={1} className="w-20" />
          </div>
          <Button variant="ghost" size="icon" className="hover:bg-white/10">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </footer>
    </div>
  )
}