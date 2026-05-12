// Parse section content JSON safely
export const parseContent = (content) => {
  if (!content) return null
  if (typeof content === 'object') return content
  try {
    return JSON.parse(content)
  } catch {
    return content
  }
}

// Stringify section content
export const stringifyContent = (content) => {
  if (typeof content === 'string') return content
  return JSON.stringify(content)
}

// Section type labels and colors
export const SECTION_META = {
  SUMMARY:        { label: 'Summary',        color: 'text-blue-400 bg-blue-400/10',   icon: '✦' },
  EXPERIENCE:     { label: 'Experience',     color: 'text-purple-400 bg-purple-400/10', icon: '◈' },
  EDUCATION:      { label: 'Education',      color: 'text-green-400 bg-green-400/10',  icon: '◉' },
  SKILLS:         { label: 'Skills',         color: 'text-yellow-400 bg-yellow-400/10', icon: '◈' },
  CERTIFICATIONS: { label: 'Certifications', color: 'text-orange-400 bg-orange-400/10', icon: '◎' },
  PROJECTS:       { label: 'Projects',       color: 'text-pink-400 bg-pink-400/10',    icon: '◇' },
  LANGUAGES:      { label: 'Languages',      color: 'text-teal-400 bg-teal-400/10',   icon: '◆' },
  VOLUNTEER:      { label: 'Volunteer',      color: 'text-rose-400 bg-rose-400/10',   icon: '◈' },
  CUSTOM:         { label: 'Contact Info',    color: 'text-gray-400 bg-gray-400/10',   icon: '◈' },
}

export const SECTION_TYPES = Object.keys(SECTION_META)

// Build default empty content for a section type
export const defaultContent = (type) => {
  switch (type) {
    case 'SUMMARY':         return { summary: '' }
    case 'EXPERIENCE':      return [{ company: '', title: '', dates: '', description: '' }]
    case 'EDUCATION':       return [{ school: '', degree: '', year: '' }]
    case 'SKILLS':          return { skills: [] }
    case 'CERTIFICATIONS':  return [{ title: '', issuer: '' }]
    case 'PROJECTS':        return [{ title: '', technologies: '', description: '' }]
    case 'LANGUAGES':       return [{ language: '', level: '' }]
    case 'VOLUNTEER':       return [{ organization: '', role: '', dates: '', description: '' }]
    case 'CUSTOM':          return { fullName: '', email: '', phone: '' }
    default:                return {}
  }
}

// Inject resume data into HTML template
export const injectDataIntoTemplate = (htmlLayout, cssStyles, resume, sections) => {
  if (!htmlLayout) {
    return buildFallbackHtml(resume, sections, cssStyles)
  }

  let html = htmlLayout

  // 1. Contact Info
  const contactSec = sections.find(s => s.sectionType === 'CUSTOM')
  const contact = contactSec ? parseContent(contactSec.content) : {}
  const name = contact.fullName || resume?.title || 'Your Name'
  const email = contact.email || ''
  const phone = contact.phone || ''
  const jobTitle = resume?.targetJobTitle || ''

  // Replace Header placeholders
  html = html
    .replace(/\{\{Name\}\}/g, name)
    .replace(/\{\{fullName\}\}/g, name)
    .replace(/\{\{Contact\}\}/g, `${email} ${phone ? '· ' + phone : ''}`)
    .replace(/\{\{email\}\}/g, email)
    .replace(/\{\{phone\}\}/g, phone)
    .replace(/\{\{title\}\}/g, jobTitle)

  // 2. Summary
  const summarySec = sections.find(s => s.sectionType === 'SUMMARY')
  const summaryContent = summarySec ? parseContent(summarySec.content) : {}
  html = html.replace(/\{\{summary\}\}/g, summaryContent?.summary || '')
  html = html.replace(/\{\{Summary\}\}/g, summaryContent?.summary || '')

  // 3. Experience
  const expSec = sections.find(s => s.sectionType === 'EXPERIENCE')
  const expItems = expSec ? parseContent(expSec.content) : []
  const expHtml = expItems.map(item => `
    <div class="exp-item" style="margin-bottom: 1.5rem">
      <div style="display: flex; justify-content: space-between; font-weight: bold">
        <span>${item.title || ''}</span>
        <span>${item.dates || ''}</span>
      </div>
      <div style="font-style: italic; color: #666">${item.company || ''}</div>
      <p style="margin-top: 0.5rem">${item.description || ''}</p>
    </div>
  `).join('')
  html = html.replace(/\{\{Experience\}\}/g, expHtml)
  html = html.replace(/\{\{experience\}\}/g, expHtml)

  // 4. Education
  const eduSec = sections.find(s => s.sectionType === 'EDUCATION')
  const eduItems = eduSec ? parseContent(eduSec.content) : []
  const eduHtml = eduItems.map(item => `
    <div class="edu-item" style="margin-bottom: 1rem">
      <div style="display: flex; justify-content: space-between; font-weight: bold">
        <span>${item.school || ''}</span>
        <span>${item.year || ''}</span>
      </div>
      <div>${item.degree || ''}</div>
    </div>
  `).join('')
  html = html.replace(/\{\{Education\}\}/g, eduHtml)
  html = html.replace(/\{\{education\}\}/g, eduHtml)

  // 5. Skills
  const skillSec = sections.find(s => s.sectionType === 'SKILLS')
  const skillsContent = skillSec ? parseContent(skillSec.content) : {}
  const skillList = Array.isArray(skillsContent) ? skillsContent : (skillsContent?.skills || [])
  const skillsHtml = `<div class="skills-grid" style="display: flex; flex-wrap: wrap; gap: 0.5rem">
    ${skillList.map(s => `<span style="background: #f1f5f9; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem">${s}</span>`).join('')}
  </div>`
  html = html.replace(/\{\{Skills\}\}/g, skillsHtml)
  html = html.replace(/\{\{skills\}\}/g, skillsHtml)

  // 6. Certifications
  const certSec = sections.find(s => s.sectionType === 'CERTIFICATIONS')
  const certItems = certSec ? parseContent(certSec.content) : []
  const certHtml = certItems.map(item => `
    <div class="cert-item" style="margin-bottom: 0.5rem">
      <span style="font-weight: bold">${item.title || ''}</span>
      <span style="color: #666; font-size: 0.9rem"> — ${item.issuer || ''}</span>
    </div>
  `).join('')
  html = html.replace(/\{\{Certifications\}\}/g, certHtml)
  html = html.replace(/\{\{certifications\}\}/g, certHtml)

  // 7. Projects
  const projSec = sections.find(s => s.sectionType === 'PROJECTS')
  const projItems = projSec ? parseContent(projSec.content) : []
  const projHtml = projItems.map(item => `
    <div class="proj-item" style="margin-bottom: 1.5rem">
      <div style="font-weight: bold; font-size: 1.1rem">${item.title || ''}</div>
      <div style="color: #666; font-size: 0.8rem; margin-bottom: 0.4rem">${item.technologies || ''}</div>
      <p>${item.description || ''}</p>
    </div>
  `).join('')
  html = html.replace(/\{\{Projects\}\}/g, projHtml)
  html = html.replace(/\{\{projects\}\}/g, projHtml)

  // 8. Languages
  const langSec = sections.find(s => s.sectionType === 'LANGUAGES')
  const langItems = langSec ? parseContent(langSec.content) : []
  const langHtml = langItems.map(item => `
    <div class="lang-item" style="margin-bottom: 0.4rem">
      <span style="font-weight: 500">${item.language || ''}</span>: 
      <span style="color: #666">${item.level || ''}</span>
    </div>
  `).join('')
  html = html.replace(/\{\{Languages\}\}/g, langHtml)
  html = html.replace(/\{\{languages\}\}/g, langHtml)

  // 9. Volunteer
  const volSec = sections.find(s => s.sectionType === 'VOLUNTEER')
  const volItems = volSec ? parseContent(volSec.content) : []
  const volHtml = volItems.map(item => `
    <div class="vol-item" style="margin-bottom: 1rem">
      <div style="display: flex; justify-content: space-between; font-weight: bold">
        <span>${item.organization || ''}</span>
        <span>${item.dates || ''}</span>
      </div>
      <div style="font-style: italic; font-size: 0.9rem">${item.role || ''}</div>
      <p style="margin-top: 0.3rem">${item.description || ''}</p>
    </div>
  `).join('')
  html = html.replace(/\{\{Volunteer\}\}/g, volHtml)
  html = html.replace(/\{\{volunteer\}\}/g, volHtml)

  return wrapInHtml(html, cssStyles)
}

export const buildFallbackHtml = (resume, sections, cssStyles) => {
  const contact = parseContent(sections.find(s => s.sectionType === 'CUSTOM')?.content) || {}
  const summary = parseContent(sections.find(s => s.sectionType === 'SUMMARY')?.content)
  const experience = parseContent(sections.find(s => s.sectionType === 'EXPERIENCE')?.content) || []
  const education = parseContent(sections.find(s => s.sectionType === 'EDUCATION')?.content) || []
  const skills = parseContent(sections.find(s => s.sectionType === 'SKILLS')?.content)
  const skillList = Array.isArray(skills) ? skills : (skills?.skills || [])
  const certs = parseContent(sections.find(s => s.sectionType === 'CERTIFICATIONS')?.content) || []
  const projects = parseContent(sections.find(s => s.sectionType === 'PROJECTS')?.content) || []

  const body = `
    <div class="resume">
      <header>
        <h1>${contact.fullName || resume?.title || 'Your Name'}</h1>
        <p class="job-title">${resume?.targetJobTitle || ''}</p>
        <div class="contact-row">
          ${contact.email ? `<span>${contact.email}</span>` : ''}
          ${contact.phone ? `<span>${contact.phone}</span>` : ''}
        </div>
      </header>

      ${summary?.summary ? `
      <section>
        <h2>Summary</h2>
        <p>${summary.summary}</p>
      </section>` : ''}

      ${experience.length ? `
      <section>
        <h2>Experience</h2>
        ${experience.map(e => `
          <div class="entry">
            <div class="entry-header">
              <strong>${e.title || ''}</strong>
              <span class="muted">${e.dates || ''}</span>
            </div>
            <div class="company">${e.company || ''}</div>
            <p>${e.description || ''}</p>
          </div>
        `).join('')}
      </section>` : ''}

      ${education.length ? `
      <section>
        <h2>Education</h2>
        ${education.map(e => `
          <div class="entry">
            <div class="entry-header">
              <strong>${e.school || ''}</strong>
              <span class="muted">${e.year || ''}</span>
            </div>
            <div class="company">${e.degree || ''}</div>
          </div>
        `).join('')}
      </section>` : ''}

      ${skillList.length ? `
      <section>
        <h2>Skills</h2>
        <div class="skills">
          ${skillList.map(s => `<span class="skill-tag">${s}</span>`).join('')}
        </div>
      </section>` : ''}
    </div>
  `
  return wrapInHtml(body, cssStyles)
}

const wrapInHtml = (body, cssStyles) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; color: #1a1a2e; background: white; padding: 40px; line-height: 1.5; }
    .resume { max-width: 800px; margin: 0 auto; }
    header { margin-bottom: 2rem; }
    h1 { font-size: 2.5rem; font-weight: 800; line-height: 1.1; }
    .contact-row { display: flex; gap: 1rem; color: #64748b; font-size: 0.9rem; margin-top: 0.5rem; }
    section { margin-top: 2rem; }
    h2 { font-size: 1.2rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; margin-bottom: 1rem; color: #334155; }
    ${cssStyles || ''}
  </style>
</head>
<body>${body}</body>
</html>
`
