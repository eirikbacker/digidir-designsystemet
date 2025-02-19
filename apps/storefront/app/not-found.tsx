import type * as React from 'react';
import NextLink from 'next/link';
import { Heading, Link, Paragraph } from '@digdir/designsystemet-react';
import Image from 'next/image';
import type { Metadata } from 'next';
import { Container } from '@repo/components';

import classes from './not-found.module.css';

export const metadata: Metadata = {
  title: 'Fant ikke siden',
};

const NotFound = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className={classes.content}>
      <Container className={classes.container}>
        <div className={classes.imgContainer}>
          <Image
            className={classes.img}
            src='/img/man-binoculars.svg'
            alt='Mann med kikkert'
            height={205}
            width={290}
          />
        </div>
        <div className={classes.textContainer}>
          <Heading
            spacing
            size='md'
          >
            Denne siden finnes ikke
          </Heading>
          <Paragraph spacing>
            Beklager, vi finner ikke siden du ba om. Siden kan være flyttet
            eller slettet.
          </Paragraph>
          <Link asChild>
            <NextLink
              href='/'
              prefetch={false}
            >
              Gå til forsiden
            </NextLink>
          </Link>
        </div>
        {children}
      </Container>
      ;
    </div>
  );
};

export default NotFound;
