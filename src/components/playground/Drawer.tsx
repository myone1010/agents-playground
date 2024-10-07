
import { useDrawer } from "@/cloud/DrawerProvider";
import * as Dialog from "@radix-ui/react-dialog";

export const Drawer = () => {
  const { isOpen, closeDrawer, drawerContent } = useDrawer();

  return (
    <Dialog.Root open={isOpen} onOpenChange={closeDrawer}>
      <Dialog.Portal>
        <Dialog.Overlay className="drawerOverlay" />
        <Dialog.Content className="drawerContent">
          <Dialog.Title className="drawerTitle">Settings</Dialog.Title>
          {drawerContent}
          <Dialog.Close asChild className="drawerClose">
            <button className="IconButton" aria-label="Close">
              <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15 9-6 6m0-6 6 6m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};