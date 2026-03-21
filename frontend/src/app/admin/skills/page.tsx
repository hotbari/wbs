'use client'
import AdminGuard from '@/components/guards/AdminGuard'
import { useSkillList, useCreateSkill, useUpdateSkill, useDeleteSkill } from '@/lib/hooks/useSkills'
import { useState } from 'react'
import type { Skill } from '@/lib/types'

export default function AdminSkillsPage() {
  const { data: skills } = useSkillList()
  const { mutate: create, isPending: creating } = useCreateSkill()
  const { mutate: update } = useUpdateSkill()
  const { mutate: del, error: deleteError } = useDeleteSkill()
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', category: '' })

  const deleteMsg = (deleteError as { response?: { data?: { message?: string } } } | null)?.response?.data?.message

  return (
    <AdminGuard>
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-xl font-semibold">Skills</h1>

        <form
          onSubmit={e => {
            e.preventDefault()
            create(
              { name: newName, category: newCategory },
              { onSuccess: () => { setNewName(''); setNewCategory('') } }
            )
          }}
          className="flex gap-2"
        >
          <input placeholder="Skill name" value={newName} onChange={e => setNewName(e.target.value)}
            className="border rounded p-2 text-sm flex-1" required />
          <input placeholder="Category" value={newCategory} onChange={e => setNewCategory(e.target.value)}
            className="border rounded p-2 text-sm w-40" required />
          <button type="submit" disabled={creating}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50">Add</button>
        </form>

        {deleteMsg && <p className="text-red-500 text-sm">{deleteMsg}</p>}

        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Category</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {skills?.map((skill: Skill) => (
              <tr key={skill.id} className="border-b">
                {editingId === skill.id ? (
                  <>
                    <td className="py-1 pr-2">
                      <input value={editForm.name}
                        onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                        className="border rounded p-1 text-sm w-full" />
                    </td>
                    <td className="py-1 pr-2">
                      <input value={editForm.category}
                        onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                        className="border rounded p-1 text-sm w-full" />
                    </td>
                    <td className="py-1">
                      <div className="flex gap-2">
                        <button
                          onClick={() => update(
                            { id: skill.id, ...editForm },
                            { onSuccess: () => setEditingId(null) }
                          )}
                          className="text-blue-600 text-xs hover:underline">Save</button>
                        <button onClick={() => setEditingId(null)} className="text-gray-400 text-xs">Cancel</button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-2 pr-4">{skill.name}</td>
                    <td className="py-2 pr-4 text-gray-500">{skill.category}</td>
                    <td className="py-2">
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setEditingId(skill.id)
                            setEditForm({ name: skill.name, category: skill.category })
                          }}
                          className="text-blue-600 text-xs hover:underline">Edit</button>
                        <button onClick={() => del(skill.id)}
                          className="text-red-500 text-xs hover:underline">Delete</button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {(!skills || skills.length === 0) && (
              <tr><td colSpan={3} className="py-4 text-center text-gray-400">No skills yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminGuard>
  )
}
