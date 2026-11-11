ALTER TABLE public.job_positions ADD COLUMN IF NOT EXISTS department text;
CREATE OR REPLACE FUNCTION public.detect_job_department() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE t text := lower(coalesce(NEW.title,'') || ' ' || coalesce(NEW.description_de,''));
BEGIN
  IF NEW.department IS NULL OR NEW.department = '' OR NEW.department = 'auto' THEN
    IF t ~ '(aussendienst|finanzcoach|berater|verkauf|vertrieb(?!sbackoffice)|agentur|trainee|kundenberater)' AND t !~ '(backoffice|innendienst|sachbearbeit|administration|assistent|operations|buchhalt|hr |personal|it |informatik|marketing)' THEN
      NEW.department := 'aussendienst';
    ELSE
      NEW.department := 'innendienst';
    END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_detect_job_department ON public.job_positions;
CREATE TRIGGER trg_detect_job_department BEFORE INSERT OR UPDATE ON public.job_positions FOR EACH ROW EXECUTE FUNCTION public.detect_job_department();
UPDATE public.job_positions SET department = NULL WHERE department IS NULL;