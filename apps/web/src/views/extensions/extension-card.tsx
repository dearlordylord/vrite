import { ExtensionIcon } from "./extension-icon";
import { mdiTune, mdiDownloadOutline } from "@mdi/js";
import { Component, Show, createSignal } from "solid-js";
import { marked } from "marked";
import {
  App,
  ExtensionDetails,
  hasPermission,
  useClient,
  useExtensions,
  useNotifications
} from "#context";
import { Card, Heading, IconButton } from "#components/primitives";

interface ExtensionCardProps {
  extension: ExtensionDetails;
  installed?: boolean;
  setOpenedExtension(extension: ExtensionDetails): void;
}

const ExtensionCard: Component<ExtensionCardProps> = (props) => {
  const { installExtension } = useExtensions();
  const [loading, setLoading] = createSignal(false);
  const renderer = new marked.Renderer();
  const linkRenderer = renderer.link;

  renderer.link = (href, title, text) => {
    const html = linkRenderer.call(renderer, href, title, text);

    if (href === text && title == null) {
      return href;
    }

    return html.replace(/^<a /, '<a target="_blank" rel="nofollow" ');
  };

  return (
    <Card class="m-0 gap-1 flex flex-col justify-center items-center" color="contrast">
      <div class="flex items-start justify-start w-full">
        <ExtensionIcon spec={props.extension.spec} />
        <Heading level={2} class="min-h-8 justify-center items-center flex">
          {props.extension.spec.displayName}
        </Heading>
        <div class="flex-1" />
        <Show when={hasPermission("manageExtensions")}>
          <IconButton
            path={props.installed ? mdiTune : mdiDownloadOutline}
            color={props.installed ? "base" : "primary"}
            text={props.installed ? "soft" : "primary"}
            label={props.installed ? "Configure" : "Install"}
            loading={loading()}
            onClick={async () => {
              if (props.extension.id) {
                props.setOpenedExtension({
                  ...props.extension,
                  config: { ...props.extension.config }
                });
              } else {
                setLoading(true);

                const installedExtension = await installExtension(props.extension);

                setLoading(false);
                props.setOpenedExtension(installedExtension);
              }
            }}
            class="m-0 my-1"
            size="small"
          />
        </Show>
      </div>
      <p
        class="text-gray-500 dark:text-gray-400 w-full"
        innerHTML={marked.parseInline(props.extension.spec.description, { renderer }) as string}
      />
    </Card>
  );
};

export { ExtensionCard };
