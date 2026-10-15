import { Link } from "react-router";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "~/components/ui/navigation-menu";
import { Button } from "~/components/ui/button";
import { rabbykit } from "~/lib/wallet";

// navigation
//  - dashboard
//  - survey: all survey, create survey
//  - archive: finished surveys
//  - profile: my survey, my responses
const menus = [
  {
    name: "Survey",
    items: [
      { name: "All surveys", description: "진행 중인 모든 설문", to: "/survey/all" },
      { name: "Create survey", description: "새 설문 만들기", to: "/survey/create" },
    ],
  },
  {
    name: "Archive",
    items: [
      { name: "Finished surveys", description: "종료된 설문", to: "/archive/finished" },
    ],
  },
  {
    name: "Profile",
    items: [
      { name: "My surveys", description: "내가 만든 설문", to: "/profile/survey" },
      { name: "My responses", description: "내가 응답한 설문", to: "/profile/response" },
    ],
  },
];

export default function Navigation() {
  return (
    <nav className="fixed top-0 right-0 left-0 z-50 border-b bg-background">
      <div className="flex items-center justify-between px-5 py-4">
        <Link to="/" className="text-lg font-bold">
          DESTAT
        </Link>

        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link to="/">Dashboard</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            {menus.map((menu) => (
              <NavigationMenuItem key={menu.name}>
                <NavigationMenuTrigger>{menu.name}</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[300px] gap-2">
                    {menu.items.map((item) => (
                      <li key={item.to}>
                        <NavigationMenuLink asChild>
                          <Link to={item.to}>
                            <div className="flex flex-col gap-1 text-sm">
                              <div className="leading-none font-medium">{item.name}</div>
                              <div className="text-muted-foreground">{item.description}</div>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <Button onClick={() => rabbykit.open()}>Connect</Button>
      </div>
    </nav>
  );
}
