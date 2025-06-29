import Logo from "@/icons/Logo";
import MenuLink from "@/app/(public)/components/MenuLink";
import menuConfig from "@/app/(public)/components/menuConfig";

export default function LeftSidebar() {
  return (
    <div className="h-full w-[308px] p-[16px] border-r-1 border-(--fly-border-color) hidden md:block fixed">
      <div className="ml-[36px]">
        <div className="p-[12px]">
          <Logo />
        </div>
        <div className="flex flex-col mt-[16px]">
          {menuConfig.map((item) => {
            const MenuIcon = item.icon;
            return <MenuLink key={item.route} href={item.route}>
              <MenuIcon />
              {item.text}
            </MenuLink>
          })}
        </div>
      </div>
    </div>
  );
}
