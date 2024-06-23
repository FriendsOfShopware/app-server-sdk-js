/**
* Opens in the Administration a new tab to the given URL and adds the shop-id as query parameter with the signature
*/
export function newTab(redirectUrl: string): Response {
  return new Response(
    JSON.stringify({
      actionType: "openNewTab",
      payload: {
        redirectUrl,
      },
    }),
    {
      headers: {
        "content-type": "application/json",
      },
    },
  );
}

/**
* Shows in the Administration a new notification with the given status and message
*/
export function notification(status: 'success'|'error'|'info'|'warning', message: string): Response {
  return new Response(
    JSON.stringify({
      actionType: "notification",
      payload: {
        status,
        message,
      },
    }),
    {
      headers: {
        "content-type": "application/json",
      }
    }
  )
}

/**
* Opens in the Administration a new modal with the given iframe URL
*/
export function modal(iframeUrl: string, size: 'small' | 'medium'|"large"|'fullscreen' = 'medium', expand: boolean = false): Response
{
  return new Response(
    JSON.stringify({
      actionType: "openModal",
      payload: {
        iframeUrl,
        size,
        expand
      }
    }),
    {
      headers: {
        "content-type": "application/json",
      }
    }
  )
}
