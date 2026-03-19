/**
 * Mustache 스타일 변수 치환 엔진
 * "{{variable}}" 패턴을 실제 값으로 교체
 */
export function renderTemplate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
    return key in variables ? variables[key] : match;
  });
}
