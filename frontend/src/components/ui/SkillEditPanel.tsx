'use client'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useMySkills } from '@/lib/hooks/useMySkills'
import { useSkillList } from '@/lib/hooks/useSkills'
import SkillBadge from '@/components/ui/SkillBadge'
import SkillFreshnessBadge from '@/components/ui/SkillFreshnessBadge'
import SkillAutocomplete from '@/components/ui/SkillAutocomplete'
import { Card, CardBody, Button, Tooltip } from '@/components/ui/primitives'
import { Plus, PencilSimple, Trash } from '@phosphor-icons/react'
import type { Proficiency, Skill, EmployeeSkill } from '@/lib/types'

const PROFICIENCY_OPTIONS: { value: Proficiency; label: string; tooltip: string }[] = [
  { value: 'BEGINNER',     label: '초급', tooltip: '기본 개념 이해, 지도 하에 작업 가능' },
  { value: 'INTERMEDIATE', label: '중급', tooltip: '독립적으로 업무 수행 가능, 일부 복잡한 작업 가능' },
  { value: 'EXPERT',       label: '고급', tooltip: '심층 전문 지식, 타인 지도 가능' },
]

interface Props {
  employeeId: string | undefined
}

type EditState = { type: 'add' } | { type: 'edit'; skill: EmployeeSkill } | null

export default function SkillEditPanel({ employeeId }: Props) {
  const { skillsQuery, addSkill, updateSkill, removeSkill } = useMySkills(employeeId)
  const { data: catalog = [] } = useSkillList()
  const [editState, setEditState] = useState<EditState>(null)
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const [proficiency, setProficiency] = useState<Proficiency>('INTERMEDIATE')

  const skills = skillsQuery.data ?? []
  const catalogMap = Object.fromEntries(catalog.map(s => [s.id, s]))
  const addedIds = skills.map(s => s.skillId)

  function openAdd() {
    setEditState({ type: 'add' })
    setSelectedSkill(null)
    setProficiency('INTERMEDIATE')
  }

  function openEdit(skill: EmployeeSkill) {
    setEditState({ type: 'edit', skill })
    setProficiency(skill.proficiency as Proficiency)
  }

  function closeForm() {
    setEditState(null)
    setSelectedSkill(null)
  }

  function handleSubmit() {
    if (editState?.type === 'add') {
      if (!selectedSkill) return
      addSkill.mutate({ skillId: selectedSkill.id, proficiency }, { onSuccess: closeForm })
    } else if (editState?.type === 'edit') {
      updateSkill.mutate({ skillId: editState.skill.skillId, proficiency }, { onSuccess: closeForm })
    }
  }

  function handleRemove(skillId: string) {
    removeSkill.mutate(skillId)
  }

  const isPending = addSkill.isPending || updateSkill.isPending

  return (
    <Card>
      <CardBody className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="label-caps">스킬</h3>
          {editState?.type !== 'add' && (
            <Button variant="ghost" size="sm" onClick={openAdd}>
              <Plus className="h-3.5 w-3.5" />추가
            </Button>
          )}
        </div>

        {skills.length > 0 && (
          <div className="space-y-2">
            {skills.map((es: EmployeeSkill) => {
              const name = catalogMap[es.skillId]?.name ?? es.skillId
              return (
                <div key={es.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <SkillBadge name={name} proficiency={es.proficiency as Proficiency} />
                    {es.updatedAt && <SkillFreshnessBadge updatedAt={es.updatedAt} />}
                  </div>
                  {editState?.type !== 'edit' || editState.skill.id !== es.id ? (
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => openEdit(es)}>
                        <PencilSimple className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost" size="sm"
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive-light"
                        onClick={() => handleRemove(es.skillId)}
                        loading={removeSkill.isPending}
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}

        <AnimatePresence>
          {editState && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="space-y-3 pt-1 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground mt-2">
                  {editState.type === 'add' ? '스킬 추가' : '스킬 수정'}
                </p>

                {editState.type === 'add' && (
                  <SkillAutocomplete
                    skills={catalog}
                    exclude={addedIds}
                    onSelect={setSelectedSkill}
                    placeholder="스킬 이름 검색..."
                  />
                )}
                {editState.type === 'add' && selectedSkill && (
                  <p className="text-xs text-muted-foreground">선택됨: <strong>{selectedSkill.name}</strong></p>
                )}

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">숙련도</p>
                  <div className="flex gap-2">
                    {PROFICIENCY_OPTIONS.map(opt => (
                      <Tooltip key={opt.value} content={opt.tooltip} position="top">
                        <button
                          type="button"
                          onClick={() => setProficiency(opt.value)}
                          className={`px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-medium border transition-colors ${
                            proficiency === opt.value
                              ? 'bg-accent text-accent-foreground border-accent'
                              : 'border-border text-muted-foreground hover:border-accent hover:text-accent'
                          }`}
                        >
                          {opt.label}
                        </button>
                      </Tooltip>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSubmit}
                    loading={isPending}
                    disabled={editState.type === 'add' && !selectedSkill}
                  >
                    저장
                  </Button>
                  <Button variant="ghost" size="sm" onClick={closeForm}>취소</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {skills.length === 0 && !editState && (
          <p className="text-xs text-muted-foreground">등록된 스킬이 없습니다.</p>
        )}
      </CardBody>
    </Card>
  )
}
