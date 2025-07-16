type UserChoice = Promise<{
  outcome: "accepted" | "dismissed"
  platform: string
}>

declare global {
  interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[]
    readonly userChoice: UserChoice
    prompt(): Promise<UserChoice>
  }
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

export {}
