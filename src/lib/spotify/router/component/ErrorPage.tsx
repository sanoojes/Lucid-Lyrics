import { House, OctagonAlert, RefreshCw, SearchX } from "lucide-solid";
import { Button } from "~/component/ui/Button";
import { t } from "~/i18n";

type ErrorPageProps = {
  icon: "404" | "error";
  title: string;
  message: string;
  errorDetails?: string;
  showRetry?: boolean;
  onRetry?: () => void;
  onHome?: () => void;
};
function ErrorPage(props: ErrorPageProps) {
  const Icon = props.icon === "404" ? SearchX : OctagonAlert;
  return (
    <div class="lucid-error-page">
      <div class="error-card">
        <div class="icon-wrapper">
          <Icon size={48} strokeWidth={1.5} />
        </div>
        <h1 class="title">{props.title}</h1>
        <p class="message">{props.message}</p>
        {props.errorDetails && <pre class="error-details">{props.errorDetails}</pre>}
        <div class="button-group">
          {props.showRetry && (
            <Button id="retry__btn" shape="rounded" variant={"outline"} onClick={props.onRetry}>
              <RefreshCw size={16} />
              <span>{t("common.tryAgain")}</span>
            </Button>
          )}
          <Button
            id="home__btn"
            variant={props.showRetry ? "outline" : "default"}
            shape="rounded"
            onClick={props.onHome}
          >
            <House size={16} />
            <span>{t("common.returnHome")}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ErrorPage;
