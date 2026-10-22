export interface Project {
  name: string
  tags?: string[]
}

export function describeProject(project: Project) {
  const tags = project.tags ?? []

  return {
    name: project.name,
    summary: tags.length > 0 ? tags.join('、') : '暂未分类',
  }
}

export const project: Project = {
  name: '共享 Oxc 配置',
  tags: ['Vue', 'TypeScript'],
}
