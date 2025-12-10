{{- define "vidis-rostering.uiFullname" -}}
{{ include "vidis-rostering.name" . }}-ui
{{- end }}

{{- define "vidis-rostering.uiLabels" -}}
{{ include "vidis-rostering.labels" . }}
app.kubernetes.io/component: ui
{{- end }}

{{- define "vidis-rostering.uiSelectorLabels" -}}
{{ include "vidis-rostering.selectorLabels" . }}
app.kubernetes.io/component: ui
{{- end }}