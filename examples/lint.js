export const members = ['小林', '小周']

export function createGreeting(name = '同事') {
  return `你好，${name}`
}

export const greetings = members.map(name => createGreeting(name))

// 取消下一行注释，查看 no-debugger 错误。
// debugger

// 取消下一行注释，查看 no-console 警告。
// console.log(greetings)
