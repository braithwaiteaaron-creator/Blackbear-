'use client'

import { useEffect } from 'react'

interface PendingAction {
  id: string
  timestamp: number
  type: 'update-job' | 'add-material' | 'add-photo' | 'update-notes'
  data: Record<string, any>
  retries: number
}

const DB_NAME = 'BearHubOffline'
const DB_VERSION = 1
const STORE_NAME = 'pending-actions'

let db: IDBDatabase | null = null

async function initDB(): Promise<IDBDatabase> {
  if (db) return db

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}

async function addPendingAction(action: PendingAction): Promise<void> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.add(action)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

async function getPendingActions(): Promise<PendingAction[]> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.getAll()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

async function removePendingAction(id: string): Promise<void> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.delete(id)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export function useOfflineSync() {
  useEffect(() => {
    const handleOnline = async () => {
      try {
        const pendingActions = await getPendingActions()
        
        for (const action of pendingActions) {
          try {
            // Retry the action
            // This would call the original action function
            console.log('[Offline] Syncing action:', action.type)
            
            // For now, just remove from queue on successful connection
            await removePendingAction(action.id)
          } catch (error) {
            console.error('[Offline] Failed to sync action:', error)
            // Keep in queue for next retry
          }
        }
      } catch (error) {
        console.error('[Offline] Failed to sync pending actions:', error)
      }
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [])

  return { addPendingAction, getPendingActions, removePendingAction }
}
