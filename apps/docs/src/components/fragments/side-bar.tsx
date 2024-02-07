import { mdiMenu, mdiClose, mdiChevronDown } from "@mdi/js";
import clsx from "clsx";
import { Component, For, JSX, createEffect, createSignal } from "solid-js";
import { menuOpened, setMenuOpened } from "#lib/state";
import { Card, Button, IconButton } from "#components/primitives";
import { logoIcon } from "#assets/icons/logo";

interface SideBarProps {
  currentSection: string;
  sections: Array<{
    label: string;
    icon: string;
    link: string;
    id: string;
  }>;
  menu: Record<
    string,
    Array<{
      label: string;
      menu: Array<{ label: string; link?: string; menu?: Array<{ label: string; link: string }> }>;
    }>
  >;
  currentPath: string;
}
interface SideBarNestedMenuProps {
  menu: Array<{ label: string; link?: string; menu?: Array<{ label: string; link: string }> }>;
  currentPath: string;
  children: JSX.Element;
  openedByDefault?: boolean;
}

const SideBarNestedMenu: Component<SideBarNestedMenuProps> = (props) => {
  const [opened, setOpened] = createSignal(
    props.openedByDefault ||
      props.menu.filter((item) => {
        return item.link && props.currentPath.includes(item.link);
      }).length > 0
  );

  return (
    <div class="flex flex-col w-full">
      <button
        class="flex justify-center items-center text-start w-full group"
        onClick={() => setOpened((opened) => !opened)}
      >
        <div class="flex-1">{props.children}</div>
        <IconButton
          path={mdiChevronDown}
          class="m-0 group-hover:bg-gray-200 group-hover:dark:bg-gray-700"
          variant="text"
          badge
          iconProps={{
            class: clsx("transform transition-transform duration-100", opened() ? "" : "-rotate-90")
          }}
        />
      </button>
      <div
        class={clsx("flex flex-1 w-full pl-3 overflow-hidden", opened() ? "max-h-full" : "max-h-0")}
      >
        <div class="flex-1 flex flex-col gap-1">
          <For each={props.menu}>
            {(item) => {
              if (item.menu) {
                return (
                  <SideBarNestedMenu currentPath={props.currentPath} menu={item.menu}>
                    <Button
                      variant="text"
                      class="justify-start w-full font-bold m-0"
                      badge
                      hover={false}
                    >
                      {item.label}
                    </Button>
                  </SideBarNestedMenu>
                );
              }

              const active = (): boolean => {
                return Boolean(item.link && props.currentPath.includes(item.link));
              };

              return (
                <Button
                  variant={active() ? "solid" : "text"}
                  class="text-start w-full m-0"
                  text={active() ? "primary" : "soft"}
                  color={active() ? "primary" : "base"}
                  link={item.link}
                >
                  {item.label}
                </Button>
              );
            }}
          </For>
        </div>
      </div>
    </div>
  );
};
const SideBar: Component<SideBarProps> = (props) => {
  createEffect(() => {
    if (menuOpened()) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  });

  return (
    <>
      <div class={clsx("h-full fixed top-0 left-0 z-2", "pl-[max(0px,calc((100%-1536px)/2))]")}>
        <Card
          class={clsx(
            "top-0 h-full z-50 min-w-80 w-full md:max-w-80 m-0  bg-gray-50 dark:bg-gray-800",
            "flex-col gap-2 justify-start items-start border-0 rounded-none flex fixed md:relative",
            "transform md:transition-transform duration-300 ease-in-out scrollbar-sm-contrast overflow-auto",
            menuOpened() ? "" : "translate-y-[100vh] md:translate-y-0"
          )}
        >
          <div class="flex items-center justify-start px-1 pb-4 pt-2">
            <IconButton
              path={logoIcon}
              color="primary"
              link="/"
              class="bg-gradient-to-tr from-red-500 to-orange-500 m-0 mr-1"
            />
            <span class="flex-1 text-2xl font-extrabold text-gray-600 dark:text-gray-200">
              rite
            </span>
            <span class="text-gray-500 dark:text-gray-400 font-semibold border-l-2 pl-2 ml-2 leading-8 border-gray-200 dark:border-gray-700">
              Documentation
            </span>
          </div>
          <div class="flex flex-col gap-2 pl-1 w-full py-4">
            <For each={props.sections}>
              {(section) => {
                return (
                  <a
                    class="flex justify-start items-center group w-full cursor-pointer"
                    target={section.link.startsWith("http") ? "_blank" : "_self"}
                    href={section.link}
                  >
                    <IconButton
                      path={section.icon}
                      class="m-0 group-hover:bg-gray-300 dark:group-hover:bg-gray-700 h-8 w-8"
                      iconProps={{ class: "h-5 w-5" }}
                      color={section.id === props.currentSection ? "primary" : "base"}
                      text={section.id === props.currentSection ? "primary" : "soft"}
                    />
                    <span class=" ml-2 text-gray-500 dark:text-gray-400">{section.label}</span>
                  </a>
                );
              }}
            </For>
          </div>
          <For each={props.menu[props.currentSection]}>
            {(menuItem) => {
              return (
                <SideBarNestedMenu
                  currentPath={props.currentPath}
                  menu={menuItem.menu}
                  openedByDefault
                >
                  <Button
                    variant="text"
                    class="justify-start w-full font-bold m-0"
                    badge
                    hover={false}
                  >
                    {menuItem.label}
                  </Button>
                </SideBarNestedMenu>
              );
            }}
          </For>
          <div class="min-h-24 md:hidden" />
        </Card>
        <IconButton
          path={menuOpened() ? mdiClose : mdiMenu}
          size="large"
          color={menuOpened() ? "contrast" : "base"}
          text="soft"
          class="fixed bottom-4 right-4 z-50 md:hidden bg-gray-800 hover:bg-gray-700 text-gray-50 hover:text-gray-50 dark:bg-gray-200 dark:hover:bg-gray-300 dark:text-gray-900 dark:hover:text-gray-900"
          onClick={() => {
            setMenuOpened(!menuOpened());
          }}
        />
      </div>
      <div class="min-w-80 hidden md:block" />
    </>
  );
};

export { SideBar };
