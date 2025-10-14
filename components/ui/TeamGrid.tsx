import { ReactNode } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Chip } from '@heroui/chip';

interface TeamMemberProps {
  name: string;
  role: string;
  bio: string;
  image?: string;
  organization?: string;
}

interface TeamGridProps {
  title?: string;
  subtitle?: string;
  members: TeamMemberProps[];
  columns?: 2 | 3 | 4;
  maxDisplay?: number;
  className?: string;
}

export function TeamGrid({
  members,
  columns = 3,
  maxDisplay,
  className = '',
}: TeamGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const displayMembers = maxDisplay ? members.slice(0, maxDisplay) : members;

  return (
    <div className={`grid ${gridCols[columns]} gap-8 ${className}`}>
      {displayMembers.map((member, index) => (
        <TeamMemberCard key={index} {...member} />
      ))}
    </div>
  );
}

function TeamMemberCard({
  name,
  role,
  bio,
  image,
  organization = 'LodgeFlow Team',
}: TeamMemberProps) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('');

  return (
    <Card className='py-4'>
      <CardHeader className='pb-0 pt-2 px-4 flex-col items-start'>
        <Chip className='mb-2' color='primary' size='sm' variant='flat'>
          {role}
        </Chip>
        <h4 className='font-bold text-large'>{name}</h4>
        <small className='text-default-500'>{organization}</small>
      </CardHeader>
      <CardBody className='overflow-visible py-2'>
        {!image && (
          <div className='w-full h-48 bg-gradient-to-br from-green-200 to-blue-200 dark:from-green-700 dark:to-blue-700 rounded-xl flex items-center justify-center mb-4'>
            <span className='text-green-700 dark:text-green-200 font-bold text-3xl'>
              {initials}
            </span>
          </div>
        )}
        <p className='text-sm text-default-600 leading-relaxed'>{bio}</p>
      </CardBody>
    </Card>
  );
}
