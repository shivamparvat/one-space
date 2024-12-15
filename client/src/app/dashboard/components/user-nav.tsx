import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { removeToken } from "@/redux/reducer/login";
import { RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";

export function UserNav() {

  const token = useSelector((state: RootState) => state.login.userToken);
  const dispatch = useDispatch()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative size-9 rounded-full focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          <Avatar className="size-9">
            <AvatarImage src={`${process.env.NEXT_PUBLIC_BASE_URL}/proxy-image?url=${token?.user?.image}`} alt="@shadcn" />
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex justify-center items-center space-y-1 space-x-1">
            <div>
              <Avatar className="size-6">
                <AvatarImage src={`${process.env.NEXT_PUBLIC_BASE_URL}/proxy-image?url=${token?.user?.image}`} alt="@shadcn" />
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex flex-col space-x-1">
              <p className="text-xs leading-none text-muted-foreground ml-1">{token?.user?.email}</p>
              <p className="text-sm font-medium leading-none">{token?.user?.first_name} {token?.user?.last_name}</p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* <DropdownMenuGroup>
          <DropdownMenuItem>
            Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Billing
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Settings
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>New Team</DropdownMenuItem>
        </DropdownMenuGroup> */}
        {/* <DropdownMenuSeparator /> */}
        <DropdownMenuItem onClick={()=>{
          dispatch(removeToken())
        }}>
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}